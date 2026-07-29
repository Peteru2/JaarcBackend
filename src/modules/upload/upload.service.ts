import { Readable } from 'node:stream';
import { cloudinary } from '../../config/cloudinary';
import { ApiError } from '../../utils/ApiError';
import { isValidImageBuffer, isValidPdfBuffer } from '../../utils/fileSignature';
import { logger } from '../../utils/logger';
import type { UploadResult } from './upload.types';

const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const uploadBuffer = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw'
): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
   const uploadStream = cloudinary.uploader.upload_stream(
  { folder: `jaarc/${folder}`, resource_type: resourceType },
  (error, result) => {
    if (error || !result) {
      logger.error({ err: error }, 'Cloudinary upload failed.');
      reject(ApiError.internal('Failed to upload file to storage.'));
      return;
    }
    resolve({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  }
);

    bufferToStream(buffer).pipe(uploadStream);
  });

const uploadImage = async (file: Express.Multer.File): Promise<UploadResult> => {
  if (!isValidImageBuffer(file.buffer)) {
    throw ApiError.badRequest(
      'The file content does not match a valid image format.'
    );
  }
  return uploadBuffer(file.buffer, 'images', 'image');
};

const uploadPdf = async (file: Express.Multer.File): Promise<UploadResult> => {
  if (!isValidPdfBuffer(file.buffer)) {
    throw ApiError.badRequest(
      'The file content does not match a valid PDF format.'
    );
  }
  return uploadBuffer(file.buffer, 'documents', 'raw');
};

const deleteAsset = async (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const uploadService = {
  uploadImage,
  uploadPdf,
  deleteAsset,
};