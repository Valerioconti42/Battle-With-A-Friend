import { AppError } from '../errors.js'; // Import the base class!

export function errorHandler(err, req, res, next) {
  // 1. If it's one of our custom AppErrors, it has a built-in status and code!
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err.details || null
      }
    });
  }

  // 2. If it is NOT an AppError, it is an unexpected bug.
  // We log it heavily for debugging, but hide the crash details from the user.
  console.error('[Unhandled Server Error]', err);

  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500
    }
  });
}
