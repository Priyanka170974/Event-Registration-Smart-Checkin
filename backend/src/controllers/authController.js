import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function issueToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function authResponse(user) {
  return {
    token: issueToken(user),
    user: user.toJSON(),
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists.', 'EMAIL_IN_USE');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role });

  res.status(201).json({
    message: 'Account created successfully.',
    ...authResponse(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  res.json({
    message: 'Signed in successfully.',
    ...authResponse(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });

  res.json({ message: 'Signed out successfully.' });
});
