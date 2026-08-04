import type { Event, EventStatus } from '../../generated/prisma/client';
import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta, type PaginationMeta } from '../../utils/ApiResponse';
import { buildUniqueSlug } from '../../utils/slugify';
import { computeEventTimelineStatus, type EventTimelineStatus } from '../../utils/eventStatus';
import { uploadService } from '../upload/upload.service';
import { eventRepository } from './event.repository';
import type { CreateEventInput, UpdateEventInput } from './event.validation';

interface EventWithTimeline extends Event {
  timelineStatus: EventTimelineStatus;
}

const withTimelineStatus = (event: Event): EventWithTimeline => ({
  ...event,
  timelineStatus: computeEventTimelineStatus(event.startDate, event.endDate),
});

const getPublicList = async (
  page: number,
  limit: number,
  filter?: 'upcoming' | 'ongoing' | 'past'
): Promise<{ events: EventWithTimeline[]; meta: PaginationMeta }> => {
  // Fetch a wider window since timeline filtering happens after the DB
  // query — a fixed page of raw rows might not contain `limit` many
  // matches for the requested timeline bucket.
  const { events, total } = await eventRepository.findMany({
    status: 'PUBLISHED',
    page,
    limit: limit * 3,
  });

  const withStatus = events.map(withTimelineStatus);
  const filtered = filter
    ? withStatus.filter((event) => event.timelineStatus === filter.toUpperCase())
    : withStatus;

  const paged = filtered.slice(0, limit);

  return {
    events: paged,
    meta: buildPaginationMeta(page, limit, filter ? filtered.length : total),
  };
};

const getBySlug = async (slug: string): Promise<EventWithTimeline> => {
  const event = await eventRepository.findBySlug(slug, 'PUBLISHED');
  if (!event) throw ApiError.notFound('Event not found.');
  return withTimelineStatus(event);
};

const getAdminList = async (
  page: number,
  limit: number,
  status?: EventStatus
): Promise<{ events: EventWithTimeline[]; meta: PaginationMeta }> => {
  const { events, total } = await eventRepository.findMany({ status, page, limit });
  return {
    events: events.map(withTimelineStatus),
    meta: buildPaginationMeta(page, limit, total),
  };
};

const getAdminById = async (id: string): Promise<EventWithTimeline> => {
  const event = await eventRepository.findById(id);
  if (!event) throw ApiError.notFound('Event not found.');
  return withTimelineStatus(event);
};

const create = async (input: CreateEventInput): Promise<Event> => {
  const existingSlugs = new Set(await eventRepository.listSlugs());
  const slug = buildUniqueSlug(input.title, existingSlugs);

  return eventRepository.create({
    slug,
    title: input.title,
    tags: input.tags,
    host: input.host,
    locationType: input.locationType,
    locationValue: input.locationValue,
    startDate: input.startDate,
    endDate: input.endDate,
    image: input.image,
    imagePublicId: input.imagePublicId,
    excerpt: input.excerpt,
    description: input.description as never,
    registrationUrl: input.registrationUrl,
    status: input.publish ? 'PUBLISHED' : 'DRAFT',
  });
};

const update = async (id: string, input: UpdateEventInput): Promise<Event> => {
  const existing = await eventRepository.findById(id);
  if (!existing) throw ApiError.notFound('Event not found.');

  if (
    input.imagePublicId &&
    existing.imagePublicId &&
    input.imagePublicId !== existing.imagePublicId
  ) {
    await uploadService.deleteAsset(existing.imagePublicId, 'image');
  }

  return eventRepository.update(id, {
    title: input.title,
    tags: input.tags,
    host: input.host,
    locationType: input.locationType,
    locationValue: input.locationValue,
    startDate: input.startDate,
    endDate: input.endDate,
    image: input.image,
    imagePublicId: input.imagePublicId,
    excerpt: input.excerpt,
    registrationUrl: input.registrationUrl,
    ...(input.description ? { description: input.description as never } : {}),
    ...(input.publish !== undefined
      ? { status: input.publish ? 'PUBLISHED' : 'DRAFT' }
      : {}),
  });
};

const remove = async (id: string): Promise<void> => {
  const event = await eventRepository.findById(id);
  if (!event) throw ApiError.notFound('Event not found.');

  if (event.imagePublicId) {
    await uploadService.deleteAsset(event.imagePublicId, 'image');
  }

  await eventRepository.remove(id);
};

const publish = async (id: string): Promise<Event> => {
  const event = await eventRepository.findById(id);
  if (!event) throw ApiError.notFound('Event not found.');
  return eventRepository.update(id, { status: 'PUBLISHED' });
};

export const eventService = {
  getPublicList,
  getBySlug,
  getAdminList,
  getAdminById,
  create,
  update,
  remove,
  publish,
};