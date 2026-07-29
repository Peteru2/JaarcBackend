import type { Response } from 'express';
import { HttpStatus, type HttpStatusCode } from '../constants/httpStatus';
import type { FieldError } from './ApiError';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorBody {
  success: false;
  message: string;
  errors?: FieldError[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Request completed successfully.',
  statusCode: HttpStatusCode = HttpStatus.OK,
  meta?: PaginationMeta
): Response<SuccessBody<T>> => {
  const body: SuccessBody<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  errors?: FieldError[]
): Response<ErrorBody> => {
  const body: ErrorBody = { success: false, message };
  if (errors && errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};