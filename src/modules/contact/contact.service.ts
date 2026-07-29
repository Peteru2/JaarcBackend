import type { ContactSubmission } from '../../generated/prisma/client';
import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta, type PaginationMeta } from '../../utils/ApiResponse';
import { serviceRepository } from '../service/service.repository';
import { emailService } from '../email/email.service';
import { contactRepository } from './contact.repository';
import type { CreateContactSubmissionInput } from './contact.validation';

const submit = async (
  input: CreateContactSubmissionInput,
  ipAddress: string | undefined
): Promise<ContactSubmission> => {
  let serviceName: string | null = null;

  if (input.serviceId) {
    const service = await serviceRepository.findById(input.serviceId);
    if (!service) {
      throw ApiError.badRequest('The selected service does not exist.');
    }
    serviceName = service.name;
  }

  const submission = await contactRepository.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    message: input.message,
    ipAddress,
    ...(input.serviceId
      ? { service: { connect: { id: input.serviceId } } }
      : {}),
  });

  // Fire-and-forget: the submission is already persisted, so a failed
  // notification email must not affect the response sent to the user.
  void emailService.sendContactNotification({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    message: input.message,
    serviceName,
  });

  return submission;
};

const getAll = async (
  page: number,
  limit: number,
  isRead?: boolean
): Promise<{ submissions: unknown[]; meta: PaginationMeta }> => {
  const { submissions, total } = await contactRepository.findMany({
    page,
    limit,
    isRead,
  });

  return { submissions, meta: buildPaginationMeta(page, limit, total) };
};

const getById = async (id: string): Promise<ContactSubmission> => {
  const submission = await contactRepository.findById(id);

  if (!submission) {
    throw ApiError.notFound('Contact submission not found.');
  }

  return submission;
};

const markAsRead = async (id: string): Promise<ContactSubmission> => {
  const existing = await contactRepository.findById(id);

  if (!existing) {
    throw ApiError.notFound('Contact submission not found.');
  }

  return contactRepository.markAsRead(id);
};

const remove = async (id: string): Promise<void> => {
  const existing = await contactRepository.findById(id);

  if (!existing) {
    throw ApiError.notFound('Contact submission not found.');
  }

  await contactRepository.remove(id);
};

export const contactService = {
  submit,
  getAll,
  getById,
  markAsRead,
  remove,
};