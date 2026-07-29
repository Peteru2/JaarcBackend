import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { Messages } from '../../constants/messages';
import { verifyPassword } from '../../utils/password';
import { authRepository } from './auth.repository'
import type {
  AuthenticatedUser,
  JwtPayload,
  LoginResult,
} from './auth.types';

const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'jaarc-api',
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'jaarc-api',
  });

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'string' ||
    typeof (decoded as Record<string, unknown>)['email'] !== 'string'
  ) {
    throw ApiError.unauthorized(Messages.INVALID_TOKEN);
  }

  return {
    sub: decoded.sub,
    email: (decoded as Record<string, unknown>)['email'] as string,
  };
};

const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    // Hash a dummy value so response timing does not reveal whether
    // the email exists in the database.
    await verifyPassword(password, '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu');
    throw ApiError.unauthorized(Messages.INVALID_CREDENTIALS);
  } 

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(Messages.INVALID_CREDENTIALS);
  }

  const token = signToken({ sub: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
    expiresIn: env.JWT_EXPIRES_IN,
  };
};

const getCurrentUser = async (
  userId: string
): Promise<AuthenticatedUser> => {
  const user = await authRepository.findById(userId);

  if (!user) {
    throw ApiError.unauthorized(Messages.INVALID_TOKEN);
  }

  return { id: user.id, email: user.email, name: user.name };
};

export const authService = {
  login,
  getCurrentUser,
  verifyToken,
};