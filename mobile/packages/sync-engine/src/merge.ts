import type { EventEnvelope, VectorClock } from './types';
import { sortCanonical } from './ordering';
import { computeVectorClock } from './vectorClock';

export function dedupeByEventId(events: readonly EventEnvelope[]): EventEnvelope[] {
  const map = new Map<string, EventEnvelope>();
  for (const e of events) {
    if (!map.has(e.eventId)) map.set(e.eventId, e);
  }
  return [...map.values()];
}

export function mergeEventSets(local: readonly EventEnvelope[], remote: readonly EventEnvelope[]) {
  const merged = sortCanonical(dedupeByEventId([...local, ...remote]));
  const vc = computeVectorClock(merged);
  return { mergedEvents: merged, vectorClock: vc };
}

export function computePullKnown(vc: VectorClock | undefined): VectorClock {
  return vc ?? {};
}
