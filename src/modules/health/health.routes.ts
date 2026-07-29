import { Router } from 'express';
import { prisma } from '../../database/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      sendError(
        res,
        'The service is currently unavailable.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
      return;
    }

    sendSuccess(
      res,
      {
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      'Service is healthy.'
    );
  })
);