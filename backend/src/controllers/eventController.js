import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function registrationCounts(eventIds) {
  if (eventIds.length === 0) return new Map();

  const rows = await Registration.aggregate([
    { $match: { event: { $in: eventIds } } },
    {
      $group: {
        _id: '$event',
        registered: { $sum: 1 },
        checkedIn: { $sum: { $cond: ['$checkedIn', 1, 0] } },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row]));
}

function presentEvent(event, count = {}) {
  const registered = count.registered ?? event.registeredCount ?? 0;
  const checkedIn = count.checkedIn ?? 0;
  const remainingSeats = Math.max(event.capacity - registered, 0);
  const checkInPercentage = registered === 0
    ? 0
    : Math.round((checkedIn / registered) * 1000) / 10;

  return {
    ...event.toJSON(),
    registered,
    checkedIn,
    remainingSeats,
    checkInPercentage,
    registrationStatus: remainingSeats === 0 ? 'FULL' : 'OPEN',
  };
}

async function listEventsFor(req, organizerId) {
  const { q, status, limit, page } = req.query;
  const filter = {};

  if (organizerId) filter.organizer = organizerId;
  if (q) {
    const query = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: query }, { description: query }, { venue: query }];
  }
  if (status === 'full') {
    filter.$expr = { $gte: ['$registeredCount', '$capacity'] };
  } else if (status === 'open') {
    filter.$expr = { $lt: ['$registeredCount', '$capacity'] };
  }

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  const counts = await registrationCounts(events.map((event) => event._id));
  const data = events.map((event) => presentEvent(event, counts.get(event._id.toString())));

  return {
    events: data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

export const listEvents = asyncHandler(async (req, res) => {
  res.json(await listEventsFor(req));
});

export const listManagedEvents = asyncHandler(async (req, res) => {
  res.json(await listEventsFor(req, req.user._id));
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name');
  if (!event) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');

  const counts = await registrationCounts([event._id]);
  res.json({ event: presentEvent(event, counts.get(event._id.toString())) });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });

  res.status(201).json({
    message: 'Event created successfully.',
    event: presentEvent(event),
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const existing = await Event.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');
  if (existing.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only manage events you created.', 'NOT_EVENT_OWNER');
  }

  const filter = { _id: req.params.id, organizer: req.user._id };
  if (req.body.capacity !== undefined) {
    filter.$expr = { $gte: [req.body.capacity, '$registeredCount'] };
  }

  const event = await Event.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  }).populate('organizer', 'name');

  if (!event) {
    throw new ApiError(
      409,
      'Capacity cannot be lower than the number of existing registrations.',
      'CAPACITY_BELOW_REGISTERED',
    );
  }

  const counts = await registrationCounts([event._id]);
  res.json({
    message: 'Event updated successfully.',
    event: presentEvent(event, counts.get(event._id.toString())),
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const existing = await Event.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');
  if (existing.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only manage events you created.', 'NOT_EVENT_OWNER');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const deleted = await Event.findOneAndDelete(
        { _id: req.params.id, organizer: req.user._id },
        { session },
      );
      if (!deleted) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');

      await Registration.deleteMany({ event: req.params.id }, { session });
    });
  } finally {
    await session.endSession();
  }

  res.json({ message: 'Event and its registrations were deleted successfully.' });
});
