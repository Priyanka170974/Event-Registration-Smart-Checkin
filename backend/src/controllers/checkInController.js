import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function ticketPayload(registration) {
  return {
    id: registration._id,
    ticketId: registration.ticketId,
    attendeeName: registration.attendeeName,
    attendeeEmail: registration.attendeeEmail,
    event: registration.event,
    checkedIn: registration.checkedIn,
    checkedInAt: registration.checkedInAt,
  };
}

export const verifyTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = req.body;
  const eventExists = await Event.exists({ _id: eventId });
  if (!eventExists) throw new ApiError(404, 'Event not found.', 'EVENT_NOT_FOUND');

  // The checkedIn predicate is part of the atomic update. Concurrent requests
  // cannot both transition a ticket from false to true.
  const registration = await Registration.findOneAndUpdate(
    { ticketId, event: eventId, checkedIn: false },
    {
      $set: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: req.user._id,
      },
    },
    { new: true, runValidators: true },
  ).populate('event', 'name date time venue capacity');

  if (registration) {
    return res.status(200).json({
      success: true,
      message: 'Ticket checked in successfully.',
      ticket: ticketPayload(registration),
    });
  }

  const existing = await Registration.findOne({ ticketId }).populate(
    'event',
    'name date time venue capacity',
  );
  if (!existing) {
    throw new ApiError(404, 'Invalid Ticket. This ticket does not exist.', 'INVALID_TICKET');
  }

  if (existing.event._id.toString() !== eventId) {
    throw new ApiError(
      404,
      'Invalid Ticket for the selected event.',
      'TICKET_EVENT_MISMATCH',
    );
  }

  return res.status(409).json({
    success: false,
    message: 'Ticket Already Checked In',
    code: 'TICKET_ALREADY_CHECKED_IN',
    ticket: ticketPayload(existing),
  });
});

export const scanTicket = verifyTicket;
