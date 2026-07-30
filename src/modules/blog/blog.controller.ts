import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { blogService } from './blog.service';
import type {
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
  AdminListPostsQuery,
} from './blog.validation';

const listPublished = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, category } = req.query as unknown as ListPostsQuery;
  const { posts, meta } = await blogService.getPublishedList(page, limit, category);
  sendSuccess(res, posts, 'Posts retrieved successfully.', HttpStatus.OK, meta);
});

const listFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await blogService.getFeatured();
  sendSuccess(res, posts, 'Featured posts retrieved successfully.');
});

const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const post = await blogService.getBySlug(slug);
  sendSuccess(res, post, 'Post retrieved successfully.');
});

const adminList = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, category } =
    req.query as unknown as AdminListPostsQuery;
  const { posts, meta } = await blogService.getAdminList(
    page,
    limit,
    status,
    category
  );
  sendSuccess(res, posts, 'Posts retrieved successfully.', HttpStatus.OK, meta);
});

const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await blogService.getCategories(false);
  sendSuccess(res, categories, 'Categories retrieved successfully.');
});

const adminListCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await blogService.getCategories(true);
  sendSuccess(res, categories, 'Categories retrieved successfully.');
});

const adminGetById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const post = await blogService.getAdminById(id);
  sendSuccess(res, post, 'Post retrieved successfully.');
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreatePostInput;
  const post = await blogService.create(input);
  sendSuccess(res, post, 'Post created successfully.', HttpStatus.CREATED);
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdatePostInput;
  const post = await blogService.update(id, input);
  sendSuccess(res, post, 'Post updated successfully.');
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await blogService.remove(id);
  sendSuccess(res, null, 'Post deleted successfully.');
});

const publish = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const post = await blogService.publish(id);
  sendSuccess(res, post, 'Post published successfully.');
});

export const blogController = {
  listPublished,
  listFeatured,
  getBySlug,
  adminList,
  adminGetById,
  listCategories,
  adminListCategories,
  create,
  update,
  remove,
  publish,
};