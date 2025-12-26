import { createMetaTableSql, createTablesSql, schemaVersion } from './schema';

export type SqliteExecutor = {
  exec(sql: string): Promise<void>;
  get<T = unknown>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<void>;
  all<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
};

// Migration definitions for each version
const migrations: Record<number, string[]> = {
  1: [
    // Initial schema
    `CREATE TABLE IF NOT EXISTS restaurants (
      restaurantId TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      menu TEXT,
      status TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS menu_items (
      itemId TEXT PRIMARY KEY NOT NULL,
      restaurantId TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT,
      name_en TEXT,
      price_usd REAL NOT NULL,
      price_local REAL,
      category TEXT NOT NULL,
      isAvailable INTEGER NOT NULL DEFAULT 1,
      modifiers_json TEXT,
      recipe_json TEXT,
      FOREIGN KEY(restaurantId) REFERENCES restaurants(restaurantId)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurantId);`,
  ],
  2: [
    // Add offline-first sync tables
    `CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      vector_clock TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS event_store (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      vector_clock TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sync_status (
      entity_type TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      last_sync_at INTEGER,
      last_server_version INTEGER,
      local_version INTEGER,
      status TEXT DEFAULT 'pending',
      UNIQUE(entity_type, entity_id)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_offline_queue_timestamp ON offline_queue(timestamp);`,
    `CREATE INDEX IF NOT EXISTS idx_event_store_entity ON event_store(entity_type, entity_id);`,
  ],
  3: [
    // Complete offline-first schema
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      phone TEXT,
      role TEXT NOT NULL,
      profile_data TEXT,
      wallet_address TEXT,
      is_active INTEGER DEFAULT 1,
      last_synced_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS conflicts (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      local_version INTEGER NOT NULL,
      server_version INTEGER NOT NULL,
      local_data TEXT NOT NULL,
      server_data TEXT NOT NULL,
      resolution_strategy TEXT,
      resolved INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      resolved_at INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE,
      customer_id TEXT,
      restaurant_id TEXT NOT NULL,
      status TEXT NOT NULL,
      total_amount REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      tip_amount REAL DEFAULT 0,
      delivery_fee REAL DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'PENDING',
      delivery_address TEXT,
      special_instructions TEXT,
      estimated_delivery_time INTEGER,
      actual_delivery_time INTEGER,
      last_synced_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      transaction_id TEXT UNIQUE,
      blockchain_tx_hash TEXT,
      fee_amount REAL DEFAULT 0,
      processed_at INTEGER,
      last_synced_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );`,
    `CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      preferences TEXT NOT NULL,
      last_updated INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );`,
    // Add comprehensive indexes
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);`,
  ],
};

export async function migrate(db: SqliteExecutor): Promise<void> {
  // Create meta table if it doesn't exist
  await db.exec(createMetaTableSql);

  // Get current schema version
  const row = await db.get<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    ['schemaVersion']
  );

  const currentVersion = row ? Number(row.value) : 0;

  // If at target version, nothing to do
  if (currentVersion === schemaVersion) {
    return;
  }

  // If current version is higher than target, error
  if (currentVersion > schemaVersion) {
    throw new Error(
      `Database schema is newer than expected: current=${currentVersion}, target=${schemaVersion}`
    );
  }

  // Apply migrations incrementally
  for (let version = currentVersion + 1; version <= schemaVersion; version++) {
    const migrationSqls = migrations[version];
    if (!migrationSqls) {
      throw new Error(`No migration defined for version ${version}`);
    }

    console.log(`Applying migration to version ${version}...`);

    for (const sql of migrationSqls) {
      await db.exec(sql);
    }

    // Update schema version
    await db.run(
      'INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)',
      ['schemaVersion', String(version)]
    );

    console.log(`Migration to version ${version} completed.`);
  }

  console.log(`Database migration completed: ${currentVersion} → ${schemaVersion}`);
}
