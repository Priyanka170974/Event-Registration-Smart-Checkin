import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const rows = await Event.aggregate([
    { $match: { organizer: req.user._id } },
    {
      $lookup: {
        from: 'registrations',
        let: { eventId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$event', '$$eventId'] } } },
          {
            $group: {
              _id: '$event',
              registered: { $sum: 1 },
              checkedIn: { $sum: { $cond: ['$checkedIn', 1, 0] } },
            },
          },
        ],
        as: 'registrationStats',
      },
    },
    {
      $project: {
        name: 1,
        date: 1,
        time: 1,
        venue: 1,
        capacity: 1,
        registrationStats: { $arrayElemAt: ['$registrationStats', 0] },
      },
    },
    {
      $project: {
        name: 1,
        date: 1,
        time: 1,
        venue: 1,
        capacity: 1,
        registered: { $ifNull: ['$registrationStats.registered', 0] },
        checkedIn: { $ifNull: ['$registrationStats.checkedIn', 0] },
      },
    },
    { $sort: { date: 1 } },
  ]);

  const events = rows.map((row) => {
    const remainingSeats = Math.max(row.capacity - row.registered, 0);
    return {
      ...row,
      _id: row._id,
      remainingSeats,
      registrationStatus: remainingSeats === 0 ? 'FULL' : 'OPEN',
      checkInPercentage: row.registered === 0
        ? 0
        : Math.round((row.checkedIn / row.registered) * 1000) / 10,
    };
  });

  const summary = events.reduce(
    (totals, event) => ({
      totalEvents: totals.totalEvents + 1,
      totalCapacity: totals.totalCapacity + event.capacity,
      totalRegistered: totals.totalRegistered + event.registered,
      totalCheckedIn: totals.totalCheckedIn + event.checkedIn,
      remainingSeats: totals.remainingSeats + event.remainingSeats,
    }),
    {
      totalEvents: 0,
      totalCapacity: 0,
      totalRegistered: 0,
      totalCheckedIn: 0,
      remainingSeats: 0,
    },
  );

  summary.checkInPercentage = summary.totalRegistered === 0
    ? 0
    : Math.round((summary.totalCheckedIn / summary.totalRegistered) * 1000) / 10;

  res.json({ summary, events });
});

export const getOverview = getDashboardStats;
