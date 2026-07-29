import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { uploadRouter } from '../modules/upload/upload.routes';
import { publicBlogRouter, adminBlogRouter } from '../modules/blog/blog.routes';
import {
  publicServiceRouter,
  adminServiceRouter,
} from '../modules/service/service.routes';
import {
  publicContactRouter,
  adminContactRouter,
} from '../modules/contact/contact.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin/upload', uploadRouter);
apiRouter.use('/posts', publicBlogRouter);
apiRouter.use('/admin/posts', adminBlogRouter);
apiRouter.use('/services', publicServiceRouter);
apiRouter.use('/admin/services', adminServiceRouter);
apiRouter.use('/contact', publicContactRouter);
apiRouter.use('/admin/contact', adminContactRouter);