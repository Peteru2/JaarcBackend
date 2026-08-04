import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { eventService } from './event.service';
import type {
  CreateEventInput,
  UpdateEventInput,
  ListEventsQuery,
  AdminListEventsQuery,
} from './event.validation';

const listPublished = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, filter } = req.query as unknown as ListEventsQuery;
  const { events, meta } = await eventService.getPublicList(page, limit, filter);
  sendSuccess(res, events, 'Events retrieved successfully.', HttpStatus.OK, meta);
});

const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const event = await eventService.getBySlug(slug);
  sendSuccess(res, event, 'Event retrieved successfully.');
});

const adminList = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as unknown as AdminListEventsQuery;
  const { events, meta } = await eventService.getAdminList(page, limit, status);
  sendSuccess(res, events, 'Events retrieved successfully.', HttpStatus.OK, meta);
});

const adminGetById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const event = await eventService.getAdminById(id);
  sendSuccess(res, event, 'Event retrieved successfully.');
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateEventInput;
  const event = await eventService.create(input);
  sendSuccess(res, event, 'Event created successfully.', HttpStatus.CREATED);
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateEventInput;
  const event = await eventService.update(id, input);
  sendSuccess(res, event, 'Event updated successfully.');
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await eventService.remove(id);
  sendSuccess(res, null, 'Event deleted successfully.');
});

const publish = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const event = await eventService.publish(id);
  sendSuccess(res, event, 'Event published successfully.');
});

export const eventController = {
  listPublished,
  getBySlug,
  adminList,
  adminGetById,
  create,
  update,
  remove,
  publish,
};