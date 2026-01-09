export type ProducerId = string;
export type StreamId = string;
export type EventId = string;
export type SchemaVersion = '0.1';

export type VectorClock = Record<ProducerId, number>;

export type Actor = {
  type: 'USER' | 'SYSTEM' | 'ORACLE' | 'CHAIN';
  id: string;
};

export type EventEnvelope<TPayload = unknown> = {
  eventId: EventId;
  eventType: string;
  schemaVersion: SchemaVersion;
  streamId: StreamId;
  producerId: ProducerId;
  streamSeq: number;
  lamport: number;
  occurredAt: string;
  actor: Actor;
  payload: TPayload;
  vectorClock: VectorClock;
  hash: string;
};

export type HashFn = (inputUtf8: string) => Promise<string>;

export type Conflict = {
  entityId: string;
  reason: string;
  events: EventEnvelope[];
};

export type ApplyEventResult<TState> =
  | { type: 'APPLIED'; state: TState }
  | { type: 'CONFLICT'; conflict: Conflict };

export type EventApplier<TState> = (state: TState, event: EventEnvelope) => ApplyEventResult<TState>;
