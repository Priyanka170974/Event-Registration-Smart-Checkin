import { ApiError } from '../utils/ApiError.js';

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.', 'AUTH_REQUIRED'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.', 'FORBIDDEN'));
  }

  return next();
};
