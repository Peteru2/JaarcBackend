import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';

import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import { ApiError, type FieldError } from '../utils/ApiError';
import { HttpStatus, type HttpStatusCode } from '../constants/httpStatus';
import { Messages } from '../constants/messages';
import { sendError } from '../utils/ApiResponse';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface NormalizedError {
  statusCode: HttpStatusCode;
  message: string;
  errors?: FieldError[];
  isOperational: boolean;
}

const normalizePrismaKnownError = (
  error: Prisma.PrismaClientKnownRequestError
): NormalizedError => {
  switch (error.code) {
    case 'P2002': {
      const target = error.meta?.['target'];
      const field = Array.isArray(target) ? String(target[0]) : 'field';
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `A record with this ${field} already exists.`,
        errors: [{ field, message: 'Must be unique.' }],
        isOperational: true,
      };
    }
    case 'P2025':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The requested record was not found.',
        isOperational: true,
      };
    case 'P2003':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'The operation references a record that does not exist.',
        isOperational: true,
      };
    default:
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: Messages.SERVER_ERROR,
        isOperational: false,
      };
  }
};

const normalize = (error: unknown): NormalizedError => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors.length > 0 ? error.errors : undefined,
      isOperational: error.isOperational,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: Messages.VALIDATION_FAILED,
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      })),
      isOperational: true,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaKnownError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'The database query was malformed.',
      isOperational: false,
    };
  }

  if (error instanceof TokenExpiredError) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Your session has expired. Please sign in again.',
      isOperational: true,
    };
  }

  if (error instanceof JsonWebTokenError) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: Messages.INVALID_TOKEN,
      isOperational: true,
    };
  }

  if (error instanceof MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'The uploaded file exceeds the maximum allowed size.'
        : 'The file upload could not be processed.';
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      isOperational: true,
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: Messages.SERVER_ERROR,
    isOperational: false,
  };
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const normalized = normalize(error);

  const logPayload = {
    err: error,
    method: req.method,
    url: req.originalUrl,
    statusCode: normalized.statusCode,
  };

  if (normalized.isOperational) {
    logger.warn(logPayload, normalized.message);
  } else {
    logger.error(logPayload, 'Unhandled application error.');
  }

  const clientMessage =
    !normalized.isOperational && env.isProduction
      ? Messages.SERVER_ERROR
      : normalized.message;

  sendError(res, clientMessage, normalized.statusCode, normalized.errors);
};