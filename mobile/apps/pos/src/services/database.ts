import { openDatabaseAsync } from 'expo-sqlite';
import { Database } from '@nilelink/mobile-sqlite';

let dbInstance: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const sqliteDb = await openDatabaseAsync('nilelink-pos-db');
    dbInstance = await Database.open(sqliteDb);
    
    // Initialize mock data for demo purposes
    await initializeMockData(dbInstance);
    
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDatabase(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

async function initializeMockData(db: Database) {
  try {
    // Check if we already have data
    const existingRestaurants = await db.getRestaurant('demo-restaurant');
    if (existingRestaurants) {
      return; // Data already initialized
    }

    // Add mock restaurant
    await db.upsertRestaurant({
      restaurantId: 'demo-restaurant',
      name: 'Demo Restaurant',
      location: 'Cairo, Egypt',
      menu: '[]',
      currency: 'USD',
      status: 'active'
    });

    // Add mock menu items
    const menuItems = [
      {
        itemId: 'item_001',
        restaurantId: 'demo-restaurant',
        name: 'Classic Burger',
        name_ar: 'برجر كلاسيكي',
        price_usd: 8.99,
        price_local: 280,
        category: 'Main Course',
        description: 'Juicy beef patty with fresh lettuce, tomato, and our special sauce',
        available: true
      },
      {
        itemId: 'item_002',
        restaurantId: 'demo-restaurant',
        name: 'Margherita Pizza',
        name_ar: 'بيتزا مارغريتا',
        price_usd: 12.99,
        price_local: 405,
        category: 'Main Course',
        description: 'Fresh mozzarella, basil, and tomato sauce on crispy dough',
        available: true
      },
      {
        itemId: 'item_003',
        restaurantId: 'demo-restaurant',
        name: 'Caesar Salad',
        name_ar: 'سلطة قيصر',
        price_usd: 7.99,
        price_local: 250,
        category: 'Appetizers',
        description: 'Crisp romaine lettuce, parmesan, croutons, and Caesar dressing',
        available: true
      },
      {
        itemId: 'item_004',
        restaurantId: 'demo-restaurant',
        name: 'Falafel Plate',
        name_ar: 'صحن فلافل',
        price_usd: 6.99,
        price_local: 220,
        category: 'Appetizers',
        description: 'Traditional Egyptian falafel served with tahini sauce',
        available: true
      },
      {
        itemId: 'item_005',
        restaurantId: 'demo-restaurant',
        name: 'Chocolate Brownie',
        name_ar: 'براوني شوكولاتة',
        price_usd: 5.99,
        price_local: 190,
        category: 'Desserts',
        description: 'Warm chocolate brownie with vanilla ice cream',
        available: true
      },
      {
        itemId: 'item_006',
        restaurantId: 'demo-restaurant',
        name: 'Fresh Juice',
        name_ar: 'عصير طازج',
        price_usd: 3.99,
        price_local: 125,
        category: 'Beverages',
        description: 'Freshly squeezed orange, mango, or strawberry juice',
        available: true
      }
    ];

    for (const item of menuItems) {
      await db.run(
        `INSERT OR REPLACE INTO menu_items (itemId, restaurantId, name, name_ar, price_usd, price_local, category, description, isAvailable) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.itemId,
          item.restaurantId,
          item.name,
          item.name_ar,
          item.price_usd,
          item.price_local,
          item.category,
          item.description,
          item.available ? 1 : 0
        ]
      );
    }

    // Add mock inventory data
    const inventoryItems = [
      { itemId: 'item_001', quantity: 50, minQuantity: 20 },
      { itemId: 'item_002', quantity: 30, minQuantity: 15 },
      { itemId: 'item_003', quantity: 40, minQuantity: 15 },
      { itemId: 'item_004', quantity: 60, minQuantity: 25 },
      { itemId: 'item_005', quantity: 25, minQuantity: 10 },
      { itemId: 'item_006', quantity: 80, minQuantity: 30 }
    ];

    for (const item of inventoryItems) {
      await db.updateInventory(item.itemId, 'demo-restaurant', item.quantity, item.minQuantity);
    }

    // Add mock orders for KDS
    const mockOrders = [
      {
        orderId: 'ord_001',
        restaurantId: 'demo-restaurant',
        customerPhone: '+20 123 456 7890',
        items: [
          {
            itemId: 'item_001',
            name: 'Classic Burger',
            name_ar: 'برجر كلاسيكي',
            quantity: 2,
            price_usd: 8.99
          },
          {
            itemId: 'item_003',
            name: 'Caesar Salad',
            name_ar: 'سلطة قيصر',
            quantity: 1,
            price_usd: 7.99
          }
        ],
        total_usd: 25.97,
        orderType: 'DINE_IN',
        status: 'PAID',
        paymentMethod: 'BLOCKCHAIN'
      },
      {
        orderId: 'ord_002',
        restaurantId: 'demo-restaurant',
        customerPhone: '+20 987 654 3210',
        items: [
          {
            itemId: 'item_002',
            name: 'Margherita Pizza',
            name_ar: 'بيتزا مارغريتا',
            quantity: 1,
            price_usd: 12.99
          }
        ],
        total_usd: 12.99,
        orderType: 'TAKEAWAY',
        status: 'COOKING',
        paymentMethod: 'BLOCKCHAIN'
      }
    ];

    for (const order of mockOrders) {
      await db.createOrder(order as any);
    }

    console.log('Mock data initialized successfully');
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}

export async function clearDatabase(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.exec('DROP TABLE IF EXISTS restaurants');
      await dbInstance.exec('DROP TABLE IF EXISTS menu_items');
      await dbInstance.exec('DROP TABLE IF EXISTS orders');
      await dbInstance.exec('DROP TABLE IF EXISTS payment_queue');
      await dbInstance.exec('DROP TABLE IF EXISTS event_log');
      await dbInstance.exec('DROP TABLE IF EXISTS inventory');
      await dbInstance.exec('DROP TABLE IF EXISTS sync_metadata');
      await dbInstance.exec('DROP TABLE IF EXISTS meta');
      
      dbInstance = null;
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  }
}