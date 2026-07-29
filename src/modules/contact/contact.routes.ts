import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { contactLimiter } from '../../middleware/rateLimit.middleware';
import {
  createContactSubmissionSchema,
  listSubmissionsQuerySchema,
  idParamSchema,
} from './contact.validation';
import { contactController } from './contact.controller';

export const publicContactRouter = Router();

publicContactRouter.post(
  '/',
  contactLimiter,
  validate({ body: createContactSubmissionSchema }),
  contactController.submit
);

export const adminContactRouter = Router();

adminContactRouter.use(authenticate);

adminContactRouter.get(
  '/',
  validate({ query: listSubmissionsQuerySchema }),
  contactController.adminList
);
adminContactRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  contactController.adminGetById
);
adminContactRouter.patch(
  '/:id/read',
  validate({ params: idParamSchema }),
  contactController.markAsRead
);
adminContactRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  contactController.remove
);