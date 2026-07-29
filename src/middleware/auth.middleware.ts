import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { Messages } from '../constants/messages';
import { authService } from '../modules/auth/auth.service';

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) return null;

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) return null;

  return token;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw ApiError.unauthorized(Messages.UNAUTHORIZED);
    }

    const payload = authService.verifyToken(token);
    const user = await authService.getCurrentUser(payload.sub);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};