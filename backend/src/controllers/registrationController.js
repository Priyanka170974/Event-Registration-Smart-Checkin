import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { databaseSupportsTransactions } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createQrPayload, generateTicketId } from '../utils/ticketGenerator.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function presentTicket(registration) {
  const value = registration.toObject({ virtuals: true });
  delete value.__v;
  delete value.checkedInBy;
  return value;
}

async function getOwnedEvent(eventId, organizerId) {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');
  if (event.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, 'You can only view registrations for your own events.', 'NOT_EVENT_OWNER');
  }
  return event;
}

async function reserveEventSeat(eventId, session) {
  const options = { new: true, runValidators: true };
  if (session) options.session = session;

  return Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: { $lt: ['$registeredCount', '$capacity'] },
    },
    { $inc: { registeredCount: 1 } },
    options,
  );
}

async function throwRegistrationBoundaryError(eventId, session) {
  const query = Event.findById(eventId);
  if (session) query.session(session);
  const existingEvent = await query;

  if (!existingEvent) {
    throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');
  }

  throw new ApiError(
    409,
    'Registration closed. Event capacity has been reached.',
    'EVENT_CAPACITY_REACHED',
  );
}

async function createTicket({ attendeeName, attendeeEmail, eventId }, session) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ticketId = generateTicketId();
    const ticket = {
      attendeeName,
      attendeeEmail,
      event: eventId,
      ticketId,
      qrPayload: createQrPayload(eventId, ticketId),
    };

    try {
      if (session) {
        const [created] = await Registration.create([ticket], { session });
        return created;
      }
      return await Registration.create(ticket);
    } catch (error) {
      const isTicketCollision = error?.code === 11000 && error?.keyPattern?.ticketId;
      if (isTicketCollision && attempt < 2) continue;
      if (error?.code === 11000) {
        throw new ApiError(
          409,
          'This email address is already registered for this event.',
          'DUPLICATE_ATTENDEE_REGISTRATION',
        );
      }
      throw error;
    }
  }

  throw new ApiError(
    503,
    'A unique ticket could not be generated. Please try again.',
    'TICKET_GENERATION_FAILED',
  );
}

async function rollbackStandaloneSeat(eventId) {
  await Event.updateOne(
    { _id: eventId, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
  );
}

async function createRegistrationWithTransaction({ attendeeName, attendeeEmail, eventId }) {
  const session = await mongoose.startSession();
  let registration;

  try {
    await session.withTransaction(async () => {
      const event = await reserveEventSeat(eventId, session);
      if (!event) await throwRegistrationBoundaryError(eventId, session);
      registration = await createTicket({ attendeeName, attendeeEmail, eventId }, session);
    });
  } finally {
    await session.endSession();
  }

  return registration;
}

async function createRegistrationWithoutTransaction({ attendeeName, attendeeEmail, eventId }) {
  const event = await reserveEventSeat(eventId);
  if (!event) await throwRegistrationBoundaryError(eventId);

  try {
    return await createTicket({ attendeeName, attendeeEmail, eventId });
  } catch (error) {
    await rollbackStandaloneSeat(eventId);
    throw error;
  }
}

export const createRegistration = asyncHandler(async (req, res) => {
  const registration = databaseSupportsTransactions()
    ? await createRegistrationWithTransaction(req.body)
    : await createRegistrationWithoutTransaction(req.body);

  await registration.populate('event', 'name date time venue capacity');

  res.status(201).json({
    message: 'Registration confirmed. Your digital ticket is ready.',
    registration: presentTicket(registration),
  });
});

export const getTicket = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const registration = await Registration.findOne({ ticketId: req.params.ticketId })
    .select('+qrPayload')
    .populate('event', 'name date time venue capacity');

  if (!registration) throw new ApiError(404, 'Ticket not found.', 'TICKET_NOT_FOUND');

  res.json({ registration: presentTicket(registration) });
});

export const getRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .select('+qrPayload')
    .populate('event', 'name date time venue capacity organizer');

  if (!registration) {
    throw new ApiError(404, 'Registration not found.', 'REGISTRATION_NOT_FOUND');
  }

  await getOwnedEvent(registration.event._id, req.user._id);
  res.json({ registration: presentTicket(registration) });
});

export const listRegistrations = asyncHandler(async (req, res) => {
  const { eventId, q, page, limit } = req.query;
  if (eventId) {
    await getOwnedEvent(eventId, req.user._id);
  }

  const filter = {};
  if (eventId) {
    filter.event = eventId;
  } else {
    const ownedEvents = await Event.find({ organizer: req.user._id }).select('_id');
    filter.event = { $in: ownedEvents.map((event) => event._id) };
  }

  if (q) {
    const query = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ attendeeName: query }, { attendeeEmail: query }, { ticketId: query }];
  }

  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .select('+qrPayload')
      .populate('event', 'name date time venue capacity')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Registration.countDocuments(filter),
  ]);

  res.json({
    registrations: registrations.map(presentTicket),
    count: registrations.length,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const listEventRegistrations = asyncHandler(async (req, res) => {
  await getOwnedEvent(req.params.eventId, req.user._id);

  const filter = { event: req.params.eventId };
  if (req.query.q) {
    const query = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ attendeeName: query }, { attendeeEmail: query }, { ticketId: query }];
  }

  const registrations = await Registration.find(filter)
    .select('+qrPayload')
    .populate('event', 'name date time venue capacity')
    .sort({ createdAt: -1 });

  res.json({
    registrations: registrations.map(presentTicket),
    count: registrations.length,
  });
});
