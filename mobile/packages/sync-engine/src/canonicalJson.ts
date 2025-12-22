function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function canonicalize(value: unknown): unknown {
  if (value === null) return null;

  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;

  if (t === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('canonical_json: NaN/Infinity not allowed');
    }
    return value;
  }

  if (t === 'bigint') return value.toString(10);

  if (Array.isArray(value)) return value.map(canonicalize);

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (typeof v === 'undefined') continue;
      out[key] = canonicalize(v);
    }
    return out;
  }

  throw new Error(`canonical_json: unsupported type ${Object.prototype.toString.call(value)}`);
}

export function canonicalJsonStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}
