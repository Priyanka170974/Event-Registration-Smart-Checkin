import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required.'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: 5000,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required.'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required.'],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must use 24-hour HH:MM format.'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required.'],
      trim: true,
      maxlength: 200,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required.'],
      min: [1, 'Capacity must be at least 1.'],
      max: [100000, 'Capacity cannot exceed 100,000.'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

eventSchema.index({ organizer: 1, date: 1 });
eventSchema.index({ name: 'text', description: 'text', venue: 'text' });

export const Event = mongoose.model('Event', eventSchema);
