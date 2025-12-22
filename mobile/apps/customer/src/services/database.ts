import { openDatabaseAsync } from 'expo-sqlite';
import { Database as SQLiteDatabase } from 'expo-sqlite';

// Shared types from POS database
export interface Customer {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  createdAt: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress?: string;
  paymentMethod: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Restaurant {
  restaurantId: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image?: string;
  isOpen: boolean;
  distance: string;
}

export class CustomerDatabase {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  static async open(): Promise<CustomerDatabase> {
    const sqliteDb = await openDatabaseAsync('nilelink-customer-db');
    await sqliteDb.execAsync([
      {
        sql: `CREATE TABLE IF NOT EXISTS customers (
          customerId TEXT PRIMARY KEY,
          phone TEXT NOT NULL,
          email TEXT,
          name TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS orders (
          orderId TEXT PRIMARY KEY,
          customerId TEXT NOT NULL,
          restaurantId TEXT NOT NULL,
          restaurantName TEXT NOT NULL,
          items_json TEXT NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          deliveryAddress TEXT,
          paymentMethod TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS restaurants (
          restaurantId TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          cuisine TEXT NOT NULL,
          rating REAL NOT NULL,
          deliveryTime TEXT NOT NULL,
          deliveryFee REAL NOT NULL,
          image TEXT,
          isOpen INTEGER NOT NULL DEFAULT 1,
          distance TEXT NOT NULL
        );`,
        args: []
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customerId);`,
        args: []
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
        args: []
      }
    ]);
    return new CustomerDatabase(sqliteDb);
  }

  async getOrCreateCustomer(phone: string): Promise<Customer> {
    const result = await this.db.getFirstAsync<Customer>(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );

    if (result) {
      return result;
    }

    const customerId = `cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      'INSERT INTO customers (customerId, phone, createdAt) VALUES (?, ?, ?)',
      [customerId, phone, now]
    );

    return {
      id: customerId,
      phone,
      createdAt: now
    };
  }

  async createOrder(order: Omit<Order, 'orderId' | 'createdAt'>): Promise<string> {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO orders (orderId, customerId, restaurantId, restaurantName, items_json, total, status, deliveryAddress, paymentMethod, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        order.customerId,
        order.restaurantId,
        order.restaurantName,
        JSON.stringify(order.items),
        order.total,
        order.status,
        order.deliveryAddress || null,
        order.paymentMethod,
        now
      ]
    );

    return orderId;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC',
      [customerId]
    );

    return results.map(row => ({
      orderId: row.orderId,
      customerId: row.customerId,
      restaurantId: row.restaurantId,
      restaurantName: row.restaurantName,
      items: JSON.parse(row.items_json),
      total: row.total,
      status: row.status,
      deliveryAddress: row.deliveryAddress,
      paymentMethod: row.paymentMethod,
      createdAt: row.createdAt
    }));
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM orders WHERE orderId = ?',
      [orderId]
    );

    if (!result) return null;

    return {
      orderId: result.orderId,
      customerId: result.customerId,
      restaurantId: result.restaurantId,
      restaurantName: result.restaurantName,
      items: JSON.parse(result.items_json),
      total: result.total,
      status: result.status,
      deliveryAddress: result.deliveryAddress,
      paymentMethod: result.paymentMethod,
      createdAt: result.createdAt
    };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE orders SET status = ? WHERE orderId = ?',
      [status, orderId]
    );
  }

  async getRestaurants(): Promise<Restaurant[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM restaurants WHERE isOpen = 1 ORDER BY distance ASC'
    );

    return results.map(row => ({
      restaurantId: row.restaurantId,
      name: row.name,
      cuisine: row.cuisine,
      rating: row.rating,
      deliveryTime: row.deliveryTime,
      deliveryFee: row.deliveryFee,
      image: row.image,
      isOpen: Boolean(row.isOpen),
      distance: row.distance
    }));
  }

  async initializeMockData(): Promise<void> {
    // Check if data already exists
    const existing = await this.db.getFirstAsync('SELECT * FROM restaurants LIMIT 1');
    if (existing) return;

    const mockRestaurants = [
      {
        restaurantId: 'rest_001',
        name: 'Cairo Kitchen',
        cuisine: 'Egyptian • Mediterranean',
        rating: 4.7,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        isOpen: true,
        distance: '2.3 km'
      },
      {
        restaurantId: 'rest_002',
        name: 'Nile Grill',
        cuisine: 'Grill • Fast Food',
        rating: 4.5,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        isOpen: true,
        distance: '1.8 km'
      },
      {
        restaurantId: 'rest_003',
        name: 'Pyramid Bistro',
        cuisine: 'Italian • Pizza',
        rating: 4.8,
        deliveryTime: '30-40 min',
        deliveryFee: 3.49,
        isOpen: true,
        distance: '3.1 km'
      }
    ];

    for (const restaurant of mockRestaurants) {
      await this.db.runAsync(
        `INSERT INTO restaurants (restaurantId, name, cuisine, rating, deliveryTime, deliveryFee, isOpen, distance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurant.restaurantId,
          restaurant.name,
          restaurant.cuisine,
          restaurant.rating,
          restaurant.deliveryTime,
          restaurant.deliveryFee,
          restaurant.isOpen ? 1 : 0,
          restaurant.distance
        ]
      );
    }

    console.log('Customer mock data initialized');
  }

  async clearDatabase(): Promise<void> {
    await this.db.execAsync([
      { sql: 'DROP TABLE IF EXISTS customers', args: [] },
      { sql: 'DROP TABLE IF EXISTS orders', args: [] },
      { sql: 'DROP TABLE IF EXISTS restaurants', args: [] }
    ]);
  }
}

// Singleton instance
let customerDb: CustomerDatabase | null = null;

export async function initializeDatabase(): Promise<CustomerDatabase> {
  if (customerDb) {
    return customerDb;
  }

  customerDb = await CustomerDatabase.open();
  await customerDb.initializeMockData();
  return customerDb;
}

export function getDatabase(): CustomerDatabase {
  if (!customerDb) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return customerDb;
}