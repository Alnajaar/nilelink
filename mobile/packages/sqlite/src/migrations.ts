import { createMetaTableSql, createTablesSql, schemaVersion } from './schema';

export type SqliteExecutor = {
  exec(sql: string): Promise<void>;
  get<T = unknown>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<void>;
};

export async function migrate(db: SqliteExecutor): Promise<void> {
  await db.exec(createMetaTableSql);

  const row = await db.get<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    ['schemaVersion']
  );

  const current = row ? Number(row.value) : 0;

  if (current === 0) {
    for (const sql of createTablesSql) {
      await db.exec(sql);
    }

    await db.run(
      'INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)',
      ['schemaVersion', String(schemaVersion)]
    );

    return;
  }

  if (current !== schemaVersion) {
    throw new Error(
      `Unsupported schema migration path: current=${current}, target=${schemaVersion}`
    );
  }
}
