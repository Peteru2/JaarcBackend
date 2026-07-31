import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  adminListPostsQuerySchema,
  slugParamSchema,
  idParamSchema,
} from './blog.validation';
import { blogController } from './blog.controller';

export const publicBlogRouter = Router();
publicBlogRouter.get('/categories', blogController.listCategories);

publicBlogRouter.get(
  '/',
  validate({ query: listPostsQuerySchema }),
  blogController.listPublished
);

publicBlogRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  blogController.getBySlug
);

export const adminBlogRouter = Router();

adminBlogRouter.use(authenticate);

adminBlogRouter.get('/categories', blogController.adminListCategories);

adminBlogRouter.get(
  '/',
  validate({ query: adminListPostsQuerySchema }),
  blogController.adminList
);
adminBlogRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  blogController.adminGetById
);
adminBlogRouter.post(
  '/',
  validate({ body: createPostSchema }),
  blogController.create
);
adminBlogRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updatePostSchema }),
  blogController.update
);
adminBlogRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  blogController.remove
);
adminBlogRouter.patch(
  '/:id/publish',
  validate({ params: idParamSchema }),
  blogController.publish
);


