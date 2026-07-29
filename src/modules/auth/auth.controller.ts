import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { ApiError } from '../../utils/ApiError';
import { Messages } from '../../constants/messages';
import { authService } from './auth.service';
import type { LoginInput } from './auth.validation';

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;



  
    console.log(email);
    console.log(password);

  const result = await authService.login(email, password);

  sendSuccess(res, result, 'Signed in successfully.', HttpStatus.OK);
});

const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized(Messages.UNAUTHORIZED);
  }

  sendSuccess(res, req.user, 'Authenticated user retrieved successfully.');
});

const logout = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, null, 'Signed out successfully.');
});

export const authController = {
  login,
  me,
  logout,
};