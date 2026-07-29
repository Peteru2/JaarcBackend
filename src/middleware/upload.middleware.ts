import multer from 'multer';
import { ApiError } from '../utils/ApiError';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const PDF_MIME_TYPE = 'application/pdf';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(
        ApiError.badRequest(
          'Only JPEG, PNG, WEBP, or GIF images are allowed.'
        )
      );
      return;
    }
    callback(null, true);
  },
}).single('file');

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== PDF_MIME_TYPE) {
      callback(ApiError.badRequest('Only PDF files are allowed.'));
      return;
    }
    callback(null, true);
  },
}).single('file');