export type ISODateTimeString = string;

export type RestaurantId = string;
export type MenuItemId = string;
export type OrderId = string;
export type PaymentId = string;
export type EventId = string;

export type CurrencyCode = string; // ISO-4217 alpha-3

export type Restaurant = {
  restaurantId: RestaurantId;
  name: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  menuVersion?: string;
};

export type MenuItem = {
  itemId: MenuItemId;
  restaurantId: RestaurantId;
  name_en: string;
  name_ar: string;
  category: string;
  price_usd: number;
  price_local?: number;
  isAvailable: boolean;
  modifiers?: Array<{
    id: string;
    name_en: string;
    name_ar: string;
    price_delta_usd?: number;
    price_delta_local?: number;
  }>;
};

export type OrderFulfillment = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus =
  | 'NEW'
  | 'COOKING'
  | 'READY'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  itemId: MenuItemId;
  name_en: string;
  name_ar: string;
  qty: number;
  price_usd: number;
  price_local?: number;
  modifiers?: Array<{ id: string; name_en: string; name_ar: string }>;
  note?: string;
};

export type Order = {
  orderId: OrderId;
  restaurantId: RestaurantId;
  customerId?: string;
  customerPhone?: string;
  fulfillment: OrderFulfillment;
  items: OrderItem[];
  total_usd: number;
  total_local?: number;
  status: OrderStatus;
  createdAt: ISODateTimeString;
};

export type PaymentMethod = 'BLOCKCHAIN_USDC' | 'CASH';

export type PaymentQueueItem = {
  paymentId: PaymentId;
  orderId: OrderId;
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  txHash?: string;
  retries: number;
};

export type InventoryItem = {
  itemId: MenuItemId;
  restaurantId: RestaurantId;
  qty: number;
  lastUpdated: ISODateTimeString;
};

export type EventLogEntry = {
  eventId: EventId;
  type: string;
  data: unknown;
  timestamp: ISODateTimeString;
  synced: 0 | 1;
};
