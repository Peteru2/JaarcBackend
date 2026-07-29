import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createServiceSchema,
  updateServiceSchema,
  idParamSchema,
} from './service.validation';
import { serviceController } from './service.controller';

export const publicServiceRouter = Router();

publicServiceRouter.get('/', serviceController.listActive);

export const adminServiceRouter = Router();

adminServiceRouter.use(authenticate);

adminServiceRouter.get('/', serviceController.adminList);
adminServiceRouter.post(
  '/',
  validate({ body: createServiceSchema }),
  serviceController.create
);
adminServiceRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateServiceSchema }),
  serviceController.update
);
adminServiceRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  serviceController.deactivate
);