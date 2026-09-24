import { ApiError } from './ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  try {
    req.body = schema.body ? schema.body.parse(req.body) : req.body;
    req.params = schema.params ? schema.params.parse(req.params) : req.params;
    req.query = schema.query ? schema.query.parse(req.query) : req.query;

    next();
  } catch (error) {
    if (error?.name === 'ZodError') {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ApiError(422, 'Please correct the highlighted fields.', 'VALIDATION_ERROR', details));
    }

    return next(error);
  }
};
