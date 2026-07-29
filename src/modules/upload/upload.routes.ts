import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadImage, uploadPdf } from '../../middleware/upload.middleware';
import { uploadController } from './upload.controller';

export const uploadRouter = Router();

uploadRouter.use(authenticate);

uploadRouter.post('/image', uploadImage, uploadController.uploadImage);
uploadRouter.post('/pdf', uploadPdf, uploadController.uploadPdf);