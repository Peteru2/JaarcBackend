import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { contactService } from './contact.service';
import type {
  CreateContactSubmissionInput,
  ListSubmissionsQuery,
} from './contact.validation';

const submit = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateContactSubmissionInput;
  const submission = await contactService.submit(input, req.ip);
  sendSuccess(
    res,
    submission,
    'Your message has been received. We will be in touch soon.',
    HttpStatus.CREATED
  );
});

const adminList = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, isRead } = req.query as unknown as ListSubmissionsQuery;
  const { submissions, meta } = await contactService.getAll(page, limit, isRead);
  sendSuccess(res, submissions, 'Submissions retrieved successfully.', HttpStatus.OK, meta);
});

const adminGetById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const submission = await contactService.getById(id);
  sendSuccess(res, submission, 'Submission retrieved successfully.');
});

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const submission = await contactService.markAsRead(id);
  sendSuccess(res, submission, 'Submission marked as read.');
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await contactService.remove(id);
  sendSuccess(res, null, 'Submission deleted successfully.');
});

export const contactController = {
  submit,
  adminList,
  adminGetById,
  markAsRead,
  remove,
};