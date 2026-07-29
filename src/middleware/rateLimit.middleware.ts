import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { HttpStatus } from '../constants/httpStatus';
import { Messages } from '../constants/messages';

const buildLimiter = (
  windowMs: number,
  max: number,
  message: string
): RateLimitRequestHandler =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
  });

export const globalLimiter = buildLimiter(
  15 * 60 * 1000,
  300,
  Messages.RATE_LIMIT_EXCEEDED
);

export const authLimiter = buildLimiter(
  15 * 60 * 1000,
  5,
  'Too many login attempts. Please try again in 15 minutes.'
);

export const contactLimiter = buildLimiter(
  60 * 60 * 1000,
  5,
  'Too many enquiries submitted. Please try again later.'
);