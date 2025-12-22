import type { ResultSet, SQLiteDatabase } from 'expo-sqlite';
import type { SqliteExecutor } from './migrations';
import { migrate } from './migrations';

export type Restaurant = {
  restaurantId: string;
  name: string;
  location?: string;
  menu?: string;
  currency: string;
  status: string;
};

export type MenuItem = {
  itemId: string;
  restaurantId: string;
  name: string;
  name_ar?: string;
  price_usd: number;
  price_local?: number;
  category: string;
  description?: string;
  available: boolean;
};

export type Order = {
  orderId: string;
  restaurantId: string;
  customerId?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal_usd: number;
  subtotal_local?: number;
  tax_usd?: number;
  delivery_fee_usd?: number;
  total_usd: number;
  total_local?: number;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'CREATED' | 'PAID' | 'CONFIRMED' | 'COOKING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'BLOCKCHAIN' | 'CASH';
  blockchainTxHash?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  itemId: string;
  name: string;
  name_ar?: string;
  quantity: number;
  price_usd: number;
  price_local?: number;
  modifiers?: Modifier[];
};

export type Modifier = {
  id: string;
  name: string;
  price_usd?: number;
};

export type PaymentQueueItem = {
  paymentId: string;
  orderId: string;
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'SYNCED' | 'FAILED';
  amount_usd: number;
  txHash?: string;
  retries: number;
  createdAt: string;
  lastUpdated: string;
};

export type EventLog = {
  eventId: string;
  type: string;
  data: any;
  timestamp: string;
  streamId?: string;
  producerId?: string;
  streamSeq?: number;
  lamport?: number;
  hash?: string;
  synced: boolean;
};

export type InventoryItem = {
  itemId: string;
  restaurantId: string;
  quantity: number;
  minQuantity: number;
  lastRestocked?: string;
  lastUpdated: string;
};

export class Database implements SqliteExecutor {
  constructor(private db: SQLiteDatabase) {}

  async exec(sql: string): Promise<void> {
    await this.db.execAsync([{ sql, args: [] }]);
  }

  async get<T = unknown>(sql: string, params?: unknown[]): Promise<T | undefined> {
    const result = await this.db.getFirstAsync<T>(sql, params || []);
    return result;
  }

  async run(sql: string, params?: unknown[]): Promise<void> {
    await this.db.runAsync(sql, params || []);
  }

  async all<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.db.getAllAsync<T>(sql, params || []);
    return result;
  }

  static async open(db: SQLiteDatabase): Promise<Database> {
    const instance = new Database(db);
    await migrate(instance);
    return instance;
  }

  async getRestaurant(restaurantId: string): Promise<Restaurant | undefined> {
    return this.get<Restaurant>(
      'SELECT restaurantId, name, location, menu, currency, status FROM restaurants WHERE restaurantId = ?',
      [restaurantId]
    );
  }

  async upsertRestaurant(restaurant: Restaurant): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO restaurants (restaurantId, name, location, menu, currency, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [restaurant.restaurantId, restaurant.name, restaurant.location || '', restaurant.menu || '', restaurant.currency, restaurant.status]
    );
  }

  async getMenuItems(restaurantId: string, category?: string): Promise<MenuItem[]> {
    let sql = `SELECT itemId, restaurantId, name, name_ar, price_usd, price_local, category, description, 
               isAvailable as available FROM menu_items WHERE restaurantId = ? AND isAvailable = 1`;
    const params = [restaurantId];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    const items = await this.all<MenuItem>(sql, params);
    return items.map(item => ({
      ...item,
      available: Boolean(item.available)
    }));
  }

  async getMenuItem(itemId: string): Promise<MenuItem | undefined> {
    return this.get<MenuItem>(
      `SELECT itemId, restaurantId, name, name_ar, price_usd, price_local, category, description, 
       isAvailable as available FROM menu_items WHERE itemId = ?`,
      [itemId]
    );
  }

  async createOrder(order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.run(
      `INSERT INTO orders (orderId, restaurantId, customerId, customerPhone, items_json, total_usd, 
       total_local, orderType, status, paymentMethod, notes, blockchainTxHash, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        order.restaurantId,
        order.customerId || null,
        order.customerPhone || null,
        JSON.stringify(order.items),
        order.total_usd,
        order.total_local || null,
        order.orderType,
        order.status,
        order.paymentMethod,
        order.notes || null,
        order.blockchainTxHash || null,
        now
      ]
    );
    
    return orderId;
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const row = await this.get<any>(
      `SELECT orderId, restaurantId, customerId, customerPhone, items_json, total_usd, total_local, 
       orderType, status, paymentMethod, notes, blockchainTxHash, createdAt FROM orders WHERE orderId = ?`,
      [orderId]
    );
    
    if (!row) return undefined;
    
    return {
      ...row,
      items: JSON.parse(row.items_json),
      subtotal_usd: row.total_usd, // Simplified for now
      createdAt: row.createdAt,
      updatedAt: row.createdAt
    };
  }

  async getOrders(restaurantId: string, status?: string): Promise<Order[]> {
    let sql = `SELECT orderId, restaurantId, customerId, customerPhone, items_json, total_usd, total_local, 
               orderType, status, paymentMethod, notes, blockchainTxHash, createdAt FROM orders WHERE restaurantId = ?`;
    const params = [restaurantId];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    const rows = await this.all<any>(sql, params);
    return rows.map(row => ({
      ...row,
      items: JSON.parse(row.items_json),
      subtotal_usd: row.total_usd,
      createdAt: row.createdAt,
      updatedAt: row.createdAt
    }));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await this.run(
      'UPDATE orders SET status = ? WHERE orderId = ?',
      [status, orderId]
    );
  }

  async addToPaymentQueue(orderId: string, amount_usd: number): Promise<string> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.run(
      `INSERT INTO payment_queue (paymentId, orderId, status, amount_usd, createdAt, lastUpdated) 
       VALUES (?, ?, 'PENDING', ?, ?, ?)`,
      [paymentId, orderId, amount_usd, now, now]
    );
    
    return paymentId;
  }

  async getPaymentQueueItems(status?: string): Promise<PaymentQueueItem[]> {
    let sql = `SELECT paymentId, orderId, status, amount_usd, txHash, retries, createdAt, lastUpdated 
               FROM payment_queue`;
    const params: string[] = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY createdAt ASC';
    
    return this.all<PaymentQueueItem>(sql, params);
  }

  async updatePaymentStatus(paymentId: string, status: string, txHash?: string): Promise<void> {
    const now = new Date().toISOString();
    await this.run(
      'UPDATE payment_queue SET status = ?, txHash = ?, lastUpdated = ?, retries = retries + 1 WHERE paymentId = ?',
      [status, txHash || null, now, paymentId]
    );
  }

  async createEvent(event: Omit<EventLog, 'eventId'>): Promise<string> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.run(
      `INSERT INTO event_log (eventId, type, data, timestamp, streamId, producerId, streamSeq, lamport, hash, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, event.type, JSON.stringify(event.data), event.timestamp, 
       event.streamId || null, event.producerId || null, event.streamSeq || null, 
       event.lamport || null, event.hash || null, event.synced ? 1 : 0]
    );
    return eventId;
  }

  async getPendingEvents(): Promise<EventLog[]> {
    const rows = await this.all<any>(
      `SELECT eventId, type, data, timestamp, streamId, producerId, streamSeq, lamport, hash, synced 
       FROM event_log WHERE synced = 0 ORDER BY timestamp ASC`
    );
    
    return rows.map(row => ({
      ...row,
      data: JSON.parse(row.data),
      synced: Boolean(row.synced)
    }));
  }

  async markEventAsSynced(eventId: string): Promise<void> {
    await this.run(
      'UPDATE event_log SET synced = 1 WHERE eventId = ?',
      [eventId]
    );
  }

  async getInventory(restaurantId: string): Promise<InventoryItem[]> {
    return this.all<InventoryItem>(
      `SELECT itemId, restaurantId, qty as quantity, minQuantity, lastRestocked, lastUpdated 
       FROM inventory WHERE restaurantId = ? ORDER BY lastUpdated DESC`,
      [restaurantId]
    );
  }

  async updateInventory(itemId: string, restaurantId: string, quantity: number, minQuantity: number = 5): Promise<void> {
    const now = new Date().toISOString();
    await this.run(
      `INSERT OR REPLACE INTO inventory (itemId, restaurantId, qty, minQuantity, lastUpdated) 
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, restaurantId, quantity, minQuantity, now]
    );
  }

  async getLowStockItems(restaurantId: string): Promise<InventoryItem[]> {
    return this.all<InventoryItem>(
      `SELECT itemId, restaurantId, qty as quantity, minQuantity, lastRestocked, lastUpdated 
       FROM inventory WHERE restaurantId = ? AND qty < minQuantity ORDER BY qty ASC`,
      [restaurantId]
    );
  }

  async getSyncMetadata(key: string): Promise<string | undefined> {
    const row = await this.get<{ value: string }>(
      'SELECT value FROM sync_metadata WHERE key = ?',
      [key]
    );
    return row?.value;
  }

  async setSyncMetadata(key: string, value: string): Promise<void> {
    const now = new Date().toISOString();
    await this.run(
      'INSERT OR REPLACE INTO sync_metadata (key, value, lastUpdated) VALUES (?, ?, ?)',
      [key, value, now]
    );
  }

  async getPendingEventsCount(): Promise<number> {
    const result = await this.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM event_log WHERE synced = 0'
    );
    return result?.count || 0;
  }

  async getAllEvents(streamId: string): Promise<EventLog[]> {
    const rows = await this.all<any>(
      `SELECT eventId, type, data, timestamp, streamId, producerId, streamSeq, lamport, hash, synced 
       FROM event_log WHERE streamId = ? ORDER BY timestamp ASC`,
      [streamId]
    );
    
    return rows.map(row => ({
      ...row,
      data: JSON.parse(row.data),
      synced: Boolean(row.synced)
    }));
  }

  async replaceEvents(streamId: string, events: EventLog[]): Promise<void> {
    await this.run('DELETE FROM event_log WHERE streamId = ?', [streamId]);
    
    for (const event of events) {
      await this.run(
        `INSERT INTO event_log (eventId, type, data, timestamp, streamId, producerId, streamSeq, lamport, hash, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [event.eventId, event.type, JSON.stringify(event.data), event.timestamp, 
         event.streamId || null, event.producerId || null, event.streamSeq || null, 
         event.lamport || null, event.hash || null, event.synced ? 1 : 0]
      );
    }
  }

  async getVectorClock(streamId: string): Promise<Record<string, number> | undefined> {
    const value = await this.getSyncMetadata(`vc_${streamId}`);
    return value ? JSON.parse(value) : undefined;
  }

  async setVectorClock(streamId: string, vc: Record<string, number>): Promise<void> {
    await this.setSyncMetadata(`vc_${streamId}`, JSON.stringify(vc));
  }

  async markEventsAsUploaded(eventIds: string[]): Promise<void> {
    for (const eventId of eventIds) {
      await this.markEventAsSynced(eventId);
    }
  }
}