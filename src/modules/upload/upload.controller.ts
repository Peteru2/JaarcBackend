import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { ApiError } from '../../utils/ApiError';
import { uploadService } from './upload.service';

const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file was provided.');
  }

  const result = await uploadService.uploadImage(req.file);

  sendSuccess(res, result, 'Image uploaded successfully.', HttpStatus.CREATED);
});

const uploadPdf = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file was provided.');
  }

  const result = await uploadService.uploadPdf(req.file);

  sendSuccess(res, result, 'PDF uploaded successfully.', HttpStatus.CREATED);
});

export const uploadController = {
  uploadImage,
  uploadPdf,
};