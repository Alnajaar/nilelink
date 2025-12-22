import type { EventEnvelope, HashFn } from './types';
import { verifyEventHash } from './hashing';

export type ValidationIssue = {
  eventId?: string;
  kind: 'HASH_MISMATCH' | 'STREAMSEQ_INVALID' | 'STREAMSEQ_DUPLICATE' | 'STREAMID_MISMATCH';
  message: string;
};

export async function validateEvents(
  events: readonly EventEnvelope[],
  opts: { expectedStreamId?: string; sha256?: HashFn } = {}
): Promise<{ ok: true } | { ok: false; issues: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];
  const seqSeen = new Map<string, Set<number>>();

  for (const e of events) {
    if (opts.expectedStreamId && e.streamId !== opts.expectedStreamId) {
      issues.push({
        eventId: e.eventId,
        kind: 'STREAMID_MISMATCH',
        message: `Event streamId=${e.streamId} does not match expected ${opts.expectedStreamId}`
      });
    }

    if (!Number.isInteger(e.streamSeq) || e.streamSeq <= 0) {
      issues.push({
        eventId: e.eventId,
        kind: 'STREAMSEQ_INVALID',
        message: `Invalid streamSeq ${e.streamSeq}`
      });
    }

    const key = `${e.streamId}::${e.producerId}`;
    const set = seqSeen.get(key) ?? new Set<number>();
    if (set.has(e.streamSeq)) {
      issues.push({
        eventId: e.eventId,
        kind: 'STREAMSEQ_DUPLICATE',
        message: `Duplicate streamSeq ${e.streamSeq} for producer ${e.producerId}`
      });
    }
    set.add(e.streamSeq);
    seqSeen.set(key, set);

    if (opts.sha256) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await verifyEventHash(e, opts.sha256);
      if (!ok) {
        issues.push({
          eventId: e.eventId,
          kind: 'HASH_MISMATCH',
          message: 'Hash mismatch'
        });
      }
    }
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true };
}
