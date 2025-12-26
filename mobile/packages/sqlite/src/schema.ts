export const schemaVersion = 3;

// ============================================================================
// OFFLINE-FIRST SYNC ENGINE TABLES
// ============================================================================

export const createTablesSql = [
  // Offline event queue for Redux Saga
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

  // Event store (append-only log)
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

  // Sync status tracking
  `CREATE TABLE IF NOT EXISTS sync_status (
    entity_type TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    last_sync_at INTEGER,
    last_server_version INTEGER,
    local_version INTEGER,
    status TEXT DEFAULT 'pending',
    UNIQUE(entity_type, entity_id)
  );`,

  // Conflict resolution tracking
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

  // ============================================================================
  // BUSINESS ENTITIES (Offline-first with sync)
  // ============================================================================

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

  `CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    latitude REAL,
    longitude REAL,
    is_active INTEGER DEFAULT 1,
    settings TEXT,
    last_synced_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    preparation_time INTEGER,
    customizations TEXT,
    last_synced_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
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

  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    customizations TEXT,
    special_instructions TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
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

  `CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    unit TEXT NOT NULL,
    current_stock REAL NOT NULL,
    minimum_stock REAL DEFAULT 0,
    maximum_stock REAL,
    unit_cost REAL DEFAULT 0,
    supplier_id TEXT,
    is_active INTEGER DEFAULT 1,
    last_restocked_at INTEGER,
    last_synced_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(restaurant_id, item_id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  );`,

  `CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    inventory_id TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    reason TEXT,
    reference_id TEXT,
    unit_cost REAL DEFAULT 0,
    created_by TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(inventory_id) REFERENCES inventory(id)
  );`,

  `CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    payment_terms TEXT,
    is_active INTEGER DEFAULT 1,
    last_synced_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  // ============================================================================
  // USER PREFERENCES & DEVICE STATE
  // ============================================================================

  `CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    preferences TEXT NOT NULL,
    last_updated INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`,

  `CREATE TABLE IF NOT EXISTS device_info (
    id TEXT PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    device_name TEXT,
    platform TEXT NOT NULL,
    version TEXT NOT NULL,
    last_seen INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    last_updated INTEGER NOT NULL
  );`,

  // ============================================================================
  // INDEXES FOR PERFORMANCE
  // ============================================================================

  `CREATE INDEX IF NOT EXISTS idx_offline_queue_timestamp ON offline_queue(timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_offline_queue_entity ON offline_queue(entity_type, entity_id);`,
  `CREATE INDEX IF NOT EXISTS idx_offline_queue_retry ON offline_queue(retry_count);`,

  `CREATE INDEX IF NOT EXISTS idx_event_store_entity ON event_store(entity_type, entity_id);`,
  `CREATE INDEX IF NOT EXISTS idx_event_store_timestamp ON event_store(timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_event_store_synced ON event_store(synced);`,

  `CREATE INDEX IF NOT EXISTS idx_sync_status_entity ON sync_status(entity_type, entity_id);`,

  `CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON conflicts(entity_type, entity_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON conflicts(resolved);`,

  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);`,

  `CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);`,

  `CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);`,
  `CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);`,

  `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);`,

  `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`,

  `CREATE INDEX IF NOT EXISTS idx_inventory_restaurant ON inventory(restaurant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);`,
  `CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory(is_active);`,

  `CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements(inventory_id);`,
  `CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);`,

  `CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);`,
  `CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);`,
] as const;

export const createMetaTableSql = `CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);`;
