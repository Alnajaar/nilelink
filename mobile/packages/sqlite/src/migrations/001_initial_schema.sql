-- NileLink Mobile SQLite Schema
-- Initial schema for offline-first mobile applications

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA temp_store = MEMORY;

-- ============================================================================
-- USER & AUTHENTICATION (Offline Cache)
-- ============================================================================

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    firstName TEXT,
    lastName TEXT,
    phone TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    walletAddress TEXT,
    isActive INTEGER DEFAULT 1,
    lastSync INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE auth_tokens (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL,
    refreshToken TEXT,
    expiresAt INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- RESTAURANTS & MENUS (Cached Data)
-- ============================================================================

CREATE TABLE restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    latitude REAL,
    longitude REAL,
    isActive INTEGER DEFAULT 1,
    lastSync INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    restaurantId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    isAvailable INTEGER DEFAULT 1,
    preparationTime INTEGER, -- in minutes
    customizations TEXT, -- JSON string
    lastSync INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ============================================================================
-- ORDERS & CART (Offline Support)
-- ============================================================================

CREATE TABLE cart (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    restaurantId TEXT,
    total REAL DEFAULT 0,
    itemCount INTEGER DEFAULT 0,
    lastModified INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE SET NULL
);

CREATE TABLE cart_items (
    id TEXT PRIMARY KEY,
    cartId TEXT NOT NULL,
    menuItemId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    customizations TEXT, -- JSON string of selected options
    specialInstructions TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (cartId) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (menuItemId) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    orderNumber TEXT UNIQUE,
    userId TEXT NOT NULL,
    restaurantId TEXT NOT NULL,
    status TEXT DEFAULT 'CREATED',
    total REAL NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0,
    deliveryFee REAL DEFAULT 0,
    tip REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    paymentMethod TEXT,
    paymentStatus TEXT DEFAULT 'PENDING',
    deliveryAddress TEXT,
    specialInstructions TEXT,
    estimatedDeliveryTime INTEGER,
    actualDeliveryTime INTEGER,
    isOfflineOrder INTEGER DEFAULT 0, -- Flag for orders created offline
    syncStatus TEXT DEFAULT 'PENDING', -- pending, syncing, synced, failed
    syncAttempts INTEGER DEFAULT 0,
    lastSyncAttempt INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    menuItemId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    customizations TEXT,
    specialInstructions TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menuItemId) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- ============================================================================
-- SYNC ENGINE (Event Queuing & Conflict Resolution)
-- ============================================================================

CREATE TABLE sync_queue (
    id TEXT PRIMARY KEY,
    eventType TEXT NOT NULL,
    entityType TEXT NOT NULL,
    entityId TEXT NOT NULL,
    payload TEXT NOT NULL, -- JSON string
    metadata TEXT, -- JSON string
    timestamp INTEGER NOT NULL,
    vectorClock TEXT, -- JSON string for causal ordering
    priority INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=critical
    retryCount INTEGER DEFAULT 0,
    maxRetries INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    error TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE sync_conflicts (
    id TEXT PRIMARY KEY,
    entityType TEXT NOT NULL,
    entityId TEXT NOT NULL,
    localVersion TEXT NOT NULL, -- JSON string
    serverVersion TEXT NOT NULL, -- JSON string
    conflictType TEXT NOT NULL, -- 'modify_modify', 'delete_modify', etc.
    resolution TEXT, -- 'client_wins', 'server_wins', 'merge', 'manual'
    resolvedData TEXT, -- JSON string of merged result
    resolvedAt INTEGER,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE sync_status (
    entityType TEXT PRIMARY KEY,
    lastSync INTEGER,
    lastServerVersion TEXT,
    localVersion TEXT,
    status TEXT DEFAULT 'synced', -- synced, syncing, conflicted, offline
    pendingChanges INTEGER DEFAULT 0,
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- ============================================================================
-- OFFLINE CACHE & OPTIMIZATION
-- ============================================================================

CREATE TABLE cache_metadata (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL, -- JSON string
    expiresAt INTEGER,
    lastAccessed INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    accessCount INTEGER DEFAULT 0,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(walletAddress);
CREATE INDEX idx_users_active ON users(isActive);

-- Restaurant indexes
CREATE INDEX idx_restaurants_active ON restaurants(isActive);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

-- Menu indexes
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurantId);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(isAvailable);

-- Order indexes
CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_restaurant ON orders(restaurantId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(createdAt);
CREATE INDEX idx_orders_sync ON orders(syncStatus);

-- Cart indexes
CREATE INDEX idx_cart_user ON cart(userId);
CREATE INDEX idx_cart_items_cart ON cart_items(cartId);

-- Sync indexes
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_priority ON sync_queue(priority);
CREATE INDEX idx_sync_queue_created ON sync_queue(createdAt);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entityType, entityId);

-- Cache indexes
CREATE INDEX idx_cache_expires ON cache_metadata(expiresAt);
CREATE INDEX idx_cache_accessed ON cache_metadata(lastAccessed);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

CREATE TRIGGER update_users_timestamp
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updatedAt = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
    END;

CREATE TRIGGER update_orders_timestamp
    AFTER UPDATE ON orders
    FOR EACH ROW
    BEGIN
        UPDATE orders SET updatedAt = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
    END;

CREATE TRIGGER update_sync_queue_timestamp
    AFTER UPDATE ON sync_queue
    FOR EACH ROW
    BEGIN
        UPDATE sync_queue SET updatedAt = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
    END;

-- ============================================================================
-- VIEWS FOR QUERIES
-- ============================================================================

CREATE VIEW active_restaurants AS
SELECT * FROM restaurants WHERE isActive = 1;

CREATE VIEW available_menu_items AS
SELECT * FROM menu_items WHERE isAvailable = 1;

CREATE VIEW pending_orders AS
SELECT * FROM orders WHERE status IN ('CREATED', 'CONFIRMED', 'PREPARING');

CREATE VIEW pending_sync_events AS
SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY priority DESC, createdAt ASC;