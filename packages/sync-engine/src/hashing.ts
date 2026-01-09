import { canonicalJsonStringify } from './canonicalJson';
import type { EventEnvelope, HashFn } from './types';

export type HashableEvent = Omit<EventEnvelope, 'hash'>;

export async function computeEventHash(eventWithoutHash: HashableEvent, sha256: HashFn): Promise<string> {
  return sha256(canonicalJsonStringify(eventWithoutHash));
}

export async function verifyEventHash(event: EventEnvelope, sha256: HashFn): Promise<boolean> {
  const { hash, ...rest } = event;
  const computed = await computeEventHash(rest, sha256);
  return computed === hash;
}
