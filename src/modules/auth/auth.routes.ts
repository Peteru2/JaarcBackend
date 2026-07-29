import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { loginSchema } from './auth.validation';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login
);

authRouter.get('/me', authenticate, authController.me);
authRouter.post('/logout', authenticate, authController.logout);