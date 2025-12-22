import type { ApplyEventResult, Conflict, EventApplier, EventEnvelope } from './types';

export function reduceEvents<TState>(
  initialState: TState,
  events: readonly EventEnvelope[],
  applyEvent: EventApplier<TState>
): { state: TState; conflicts: Conflict[] } {
  let state = initialState;
  const conflicts: Conflict[] = [];

  for (const e of events) {
    const res: ApplyEventResult<TState> = applyEvent(state, e);
    if (res.type === 'APPLIED') {
      state = res.state;
      continue;
    }

    conflicts.push(res.conflict);
  }

  return { state, conflicts };
}
