import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
  adminListEventsQuerySchema,
  slugParamSchema,
  idParamSchema,
} from './event.validation';
import { eventController } from './event.controller';

export const publicEventRouter = Router();

publicEventRouter.get(
  '/',
  validate({ query: listEventsQuerySchema }),
  eventController.listPublished
);
publicEventRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  eventController.getBySlug
);

export const adminEventRouter = Router();

adminEventRouter.use(authenticate);

adminEventRouter.get(
  '/',
  validate({ query: adminListEventsQuerySchema }),
  eventController.adminList
);
adminEventRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  eventController.adminGetById
);
adminEventRouter.post(
  '/',
  validate({ body: createEventSchema }),
  eventController.create
);
adminEventRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateEventSchema }),
  eventController.update
);
adminEventRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  eventController.remove
);
adminEventRouter.patch(
  '/:id/publish',
  validate({ params: idParamSchema }),
  eventController.publish
);