export const schemaVersion = 1;

export const createTablesSql = [
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
    FOREIGN KEY(restaurantId) REFERENCES restaurants(restaurantId)
  );`,

  `CREATE TABLE IF NOT EXISTS orders (
    orderId TEXT PRIMARY KEY NOT NULL,
    restaurantId TEXT NOT NULL,
    customerId TEXT,
    customerPhone TEXT,
    items_json TEXT NOT NULL,
    total_usd REAL NOT NULL,
    total_local REAL,
    status TEXT NOT NULL,
    fulfillment TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(restaurantId) REFERENCES restaurants(restaurantId)
  );`,

  `CREATE TABLE IF NOT EXISTS payment_queue (
    paymentId TEXT PRIMARY KEY NOT NULL,
    orderId TEXT NOT NULL,
    status TEXT NOT NULL,
    txHash TEXT,
    retries INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    lastUpdated TEXT NOT NULL,
    FOREIGN KEY(orderId) REFERENCES orders(orderId)
  );`,

  `CREATE TABLE IF NOT EXISTS event_log (
    eventId TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    streamId TEXT,
    producerId TEXT,
    streamSeq INTEGER,
    lamport INTEGER,
    hash TEXT,
    synced INTEGER NOT NULL DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS inventory (
    itemId TEXT NOT NULL,
    restaurantId TEXT NOT NULL,
    qty REAL NOT NULL,
    lastUpdated TEXT NOT NULL,
    PRIMARY KEY(itemId, restaurantId)
  );`,

  `CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurantId);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurantId, status);`,
  `CREATE INDEX IF NOT EXISTS idx_event_log_synced ON event_log(synced, timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_event_log_stream ON event_log(streamId, producerId, streamSeq);`
] as const;

export const createMetaTableSql = `CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);`;
