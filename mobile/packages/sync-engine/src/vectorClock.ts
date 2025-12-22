import type { EventEnvelope, ProducerId, VectorClock } from './types';

export function computeVectorClock(events: readonly EventEnvelope[]): VectorClock {
  const vc: VectorClock = {};
  for (const e of events) {
    const current = vc[e.producerId] ?? 0;
    if (e.streamSeq > current) vc[e.producerId] = e.streamSeq;
  }
  return vc;
}

export function vectorClockLEQ(a: VectorClock, b: VectorClock): boolean {
  for (const k of Object.keys(a)) {
    if ((a[k] ?? 0) > (b[k] ?? 0)) return false;
  }
  return true;
}

export function vectorClockComparable(a: VectorClock, b: VectorClock): boolean {
  return vectorClockLEQ(a, b) || vectorClockLEQ(b, a);
}

export function bumpVectorClock(vc: VectorClock, producerId: ProducerId): VectorClock {
  return { ...vc, [producerId]: (vc[producerId] ?? 0) + 1 };
}
