import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';

/**
 * JWT Authentication Middleware
 *
 * Extracts and validates JWT token from Authorization header.
 * Header format: Authorization: Bearer <token>
 *
 * On success:
 *  - Attaches user info to req.user
 *    {
 *      id: string,
 *      username: string
 *    }
 *
 * On failure:
 *  - Throws AuthenticationError (401)
 *
 * Usage:
 *   router.get('/protected', authenticate, handler);
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check header presence and format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required');
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      throw new AuthenticationError('Authentication required');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate required payload fields
    if (!decoded.id || !decoded.username) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Attach user to request context
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
