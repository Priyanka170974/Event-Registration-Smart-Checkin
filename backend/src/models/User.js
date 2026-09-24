import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['organizer', 'volunteer'],
        message: 'Role must be organizer or volunteer.',
      },
    },
    tokenVersion: {
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

userSchema.index({ email: 1 }, { unique: true, name: 'unique_user_email' });

userSchema.set('toJSON', {
  transform(_document, returned) {
    delete returned.password;
    delete returned.tokenVersion;
    return returned;
  },
});

export const User = mongoose.model('User', userSchema);
