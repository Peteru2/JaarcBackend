export type EventTimelineStatus = 'UPCOMING' | 'ONGOING' | 'PAST';

export const computeEventTimelineStatus = (
  startDate: Date,
  endDate: Date | null
): EventTimelineStatus => {
  const now = new Date();
  const effectiveEnd = endDate ?? startDate;

  if (now < startDate) return 'UPCOMING';
  if (now >= startDate && now <= effectiveEnd) return 'ONGOING';
  return 'PAST';
};