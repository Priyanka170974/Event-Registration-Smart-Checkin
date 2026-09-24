import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    attendeeName: {
      type: String,
      required: [true, 'Attendee name is required.'],
      trim: true,
      maxlength: 100,
    },
    attendeeEmail: {
      type: String,
      required: [true, 'Attendee email is required.'],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    ticketId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    qrPayload: {
      type: String,
      required: true,
      select: false,
    },
    checkedIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

registrationSchema.index(
  { event: 1, attendeeEmail: 1 },
  { unique: true, name: 'unique_attendee_per_event' },
);
registrationSchema.index({ ticketId: 1 }, { unique: true, name: 'unique_ticket_id' });
registrationSchema.index({ event: 1, checkedIn: 1 });

registrationSchema.set('toJSON', {
  transform(_document, returned) {
    delete returned.qrPayload;
    delete returned.checkedInBy;
    return returned;
  },
});

export const Registration = mongoose.model('Registration', registrationSchema);
