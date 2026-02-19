import { AppError, AuthenticationError, ValidationError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  // Handle AuthenticationError
  if (err instanceof AuthenticationError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
      },
    });
  }

  // Handle ValidationError
  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err.details,
      },
    });
  }

  // Handle generic AppError
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
      },
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      status: 500,
    },
  });
}
