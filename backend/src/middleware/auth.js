import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AuthenticationError('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.username) {
      throw new AuthenticationError('Invalid or expired token');
    }

    req.user = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return next(new AuthenticationError('Invalid or expired token'));
    }

    return next(error);
  }
}
