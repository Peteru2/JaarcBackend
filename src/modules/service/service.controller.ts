import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { HttpStatus } from '../../constants/httpStatus';
import { serviceService } from './service.service';
import type { CreateServiceInput, UpdateServiceInput } from './service.validation';

const listActive = asyncHandler(async (_req: Request, res: Response) => {
  const services = await serviceService.getActive();
  sendSuccess(res, services, 'Services retrieved successfully.');
});

const adminList = asyncHandler(async (_req: Request, res: Response) => {
  const services = await serviceService.getAll();
  sendSuccess(res, services, 'Services retrieved successfully.');
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateServiceInput;
  const service = await serviceService.create(input);
  sendSuccess(res, service, 'Service created successfully.', HttpStatus.CREATED);
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateServiceInput;
  const service = await serviceService.update(id, input);
  sendSuccess(res, service, 'Service updated successfully.');
});

const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const service = await serviceService.deactivate(id);
  sendSuccess(res, service, 'Service deactivated successfully.');
});

export const serviceController = {
  listActive,
  adminList,
  create,
  update,
  deactivate,
};