import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function readToken(req) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice(7).trim();
}

export async function requireAuth(req, _res, next) {
  try {
    const token = readToken(req);
    if (!token) {
      throw new ApiError(401, 'Authentication required.', 'AUTH_REQUIRED');
    }

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch {
      throw new ApiError(401, 'Your session is invalid or has expired.', 'INVALID_TOKEN');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'The account for this session no longer exists.', 'INVALID_TOKEN');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new ApiError(401, 'This session has been logged out.', 'SESSION_REVOKED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
