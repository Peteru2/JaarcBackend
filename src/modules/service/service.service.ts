import type { Service } from '../../generated/prisma/client';
import { ApiError } from '../../utils/ApiError';
import { slugify } from '../../utils/slugify';
import { serviceRepository } from './service.repository';
import type { CreateServiceInput, UpdateServiceInput } from './service.validation';

const getActive = async (): Promise<Service[]> => serviceRepository.findActive();

const getAll = async (): Promise<Service[]> => serviceRepository.findAll();

const create = async (input: CreateServiceInput): Promise<Service> => {
  const existing = await serviceRepository.findByName(input.name);

  if (existing) {
    throw ApiError.conflict('A service with this name already exists.');
  }

  return serviceRepository.create({
    name: input.name,
    slug: slugify(input.name),
    order: input.order,
  });
};

const update = async (
  id: string,
  input: UpdateServiceInput
): Promise<Service> => {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    throw ApiError.notFound('Service not found.');
  }

  return serviceRepository.update(id, input);
};

// Deactivate rather than delete, so historical contact submissions keep
// a valid reference and an accurate record of what was selected.
const deactivate = async (id: string): Promise<Service> => {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    throw ApiError.notFound('Service not found.');
  }

  return serviceRepository.update(id, { isActive: false });
};

export const serviceService = {
  getActive,
  getAll,
  create,
  update,
  deactivate,
};