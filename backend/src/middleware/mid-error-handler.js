import { ValidationError, ConflictError } from '../utils/errors.js';

export default function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError || err instanceof ConflictError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err.details || {}
      }
    });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500
    }
  });
}
