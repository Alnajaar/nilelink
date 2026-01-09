import type { EventEnvelope } from './types';

export function compareCanonical(a: EventEnvelope, b: EventEnvelope): number {
  if (a.lamport !== b.lamport) return a.lamport - b.lamport;

  if (a.occurredAt !== b.occurredAt) {
    return a.occurredAt < b.occurredAt ? -1 : 1;
  }

  if (a.producerId !== b.producerId) return a.producerId < b.producerId ? -1 : 1;
  if (a.eventId !== b.eventId) return a.eventId < b.eventId ? -1 : 1;

  return 0;
}

export function sortCanonical(events: readonly EventEnvelope[]): EventEnvelope[] {
  return [...events].sort(compareCanonical);
}
