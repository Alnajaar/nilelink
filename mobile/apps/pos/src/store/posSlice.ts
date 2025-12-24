import type { AnyAction } from 'redux';
import type { Order, OrderItem, MenuItem, InventoryItem } from '@nilelink/mobile-sqlite';

export type CashTransaction = {
  timestamp: string;
  amount: number;
  reason: string;
  type: 'IN' | 'OUT';
};

export type Shift = {
  shiftId: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash: number;
  actualCash?: number;
  status: 'OPEN' | 'CLOSED';
  cashTransactions: CashTransaction[];
};

export type PosState = {
  pendingSyncCount: number;
  lastSyncStatus: 'IDLE' | 'SYNCING' | 'SYNCED' | 'FAILED';
  isConnected: boolean;
  restaurantId?: string;
  restaurantName?: string;
  currentOrder: {
    items: OrderItem[];
    customerPhone?: string;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    notes?: string;
  };
  orders: Order[];
  menuItems: MenuItem[];
  selectedCategory?: string;
  searchQuery: string;
  inventory: InventoryItem[];
  activeTab: 'dashboard' | 'orders' | 'kitchen' | 'inventory' | 'settings';
  showConflictModal: boolean;
  conflicts: Array<{
    eventId: string;
    localData: any;
    remoteData: any;
    type: string;
  }>;
  shift?: Shift;
};

const initialState: PosState = {
  pendingSyncCount: 0,
  lastSyncStatus: 'IDLE',
  isConnected: true,
  currentOrder: {
    items: [],
    orderType: 'DINE_IN'
  },
  orders: [],
  menuItems: [],
  searchQuery: '',
  inventory: [],
  activeTab: 'dashboard',
  showConflictModal: false,
  conflicts: []
};

// Sync Actions
export const POS_SYNC_REQUESTED = 'pos/SYNC_REQUESTED';
export const POS_SYNC_STARTED = 'pos/SYNC_STARTED';
export const POS_SYNC_FINISHED = 'pos/SYNC_FINISHED';
export const POS_SYNC_FAILED = 'pos/SYNC_FAILED';
export const POS_SYNC_PROGRESS = 'pos/SYNC_PROGRESS';
export const POS_PENDING_SYNC_UPDATED = 'pos/PENDING_SYNC_UPDATED';
export const POS_NETWORK_STATUS_CHANGED = 'pos/NETWORK_STATUS_CHANGED';
export const POS_CONFLICT_DETECTED = 'pos/CONFLICT_DETECTED';
export const POS_CONFLICT_RESOLVED = 'pos/CONFLICT_RESOLVED';

// Order Actions
export const POS_ORDER_CREATED = 'pos/ORDER_CREATED';
export const POS_ORDERS_FETCHED = 'pos/ORDERS_FETCHED';
export const POS_ORDER_STATUS_UPDATED = 'pos/ORDER_STATUS_UPDATED';
export const POS_ORDER_ITEM_ADDED = 'pos/ORDER_ITEM_ADDED';
export const POS_ORDER_ITEM_REMOVED = 'pos/ORDER_ITEM_REMOVED';
export const POS_ORDER_ITEM_QUANTITY_UPDATED = 'pos/ORDER_ITEM_QUANTITY_UPDATED';
export const POS_ORDER_CUSTOMER_UPDATED = 'pos/ORDER_CUSTOMER_UPDATED';
export const POS_ORDER_TYPE_UPDATED = 'pos/ORDER_TYPE_UPDATED';
export const POS_ORDER_NOTES_UPDATED = 'pos/ORDER_NOTES_UPDATED';
export const POS_ORDER_CLEARED = 'pos/ORDER_CLEARED';

// Payment Actions
export const POS_PAYMENT_PROCESSED = 'pos/PAYMENT_PROCESSED';

// Menu Actions
export const POS_MENU_ITEMS_FETCHED = 'pos/MENU_ITEMS_FETCHED';
export const POS_MENU_CATEGORY_SELECTED = 'pos/MENU_CATEGORY_SELECTED';
export const POS_MENU_SEARCH_QUERY_UPDATED = 'pos/MENU_SEARCH_QUERY_UPDATED';

// Inventory Actions
export const POS_INVENTORY_FETCHED = 'pos/INVENTORY_FETCHED';
export const POS_INVENTORY_UPDATED = 'pos/INVENTORY_UPDATED';

// Navigation Actions
export const POS_TAB_SELECTED = 'pos/TAB_SELECTED';

// Restaurant Actions
export const POS_RESTAURANT_SELECTED = 'pos/RESTAURANT_SELECTED';

// Shift Actions
export const POS_SHIFT_OPENED = 'pos/SHIFT_OPENED';
export const POS_SHIFT_CLOSED = 'pos/SHIFT_CLOSED';
export const POS_CASH_TRANSACTION_ADDED = 'pos/CASH_TRANSACTION_ADDED';

export const posActions = {
  // Sync
  syncRequested: () => ({ type: POS_SYNC_REQUESTED } as const),
  syncStarted: () => ({ type: POS_SYNC_STARTED } as const),
  syncFinished: () => ({ type: POS_SYNC_FINISHED } as const),
  syncFailed: (error: string) => ({ type: POS_SYNC_FAILED, payload: { error } } as const),
  syncProgress: (stage: string) => ({ type: POS_SYNC_PROGRESS, payload: { stage } } as const),
  pendingSyncUpdated: (count: number) =>
    ({ type: POS_PENDING_SYNC_UPDATED, payload: { count } } as const),
  networkStatusChanged: (isConnected: boolean) =>
    ({ type: POS_NETWORK_STATUS_CHANGED, payload: { isConnected } } as const),
  conflictDetected: (conflicts: any[]) =>
    ({ type: POS_CONFLICT_DETECTED, payload: { conflicts } } as const),
  conflictResolved: (eventIds: string[]) =>
    ({ type: POS_CONFLICT_RESOLVED, payload: { eventIds } } as const),

  // Orders
  orderCreated: (order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>) =>
    ({ type: POS_ORDER_CREATED, payload: { order } } as const),
  ordersFetched: (orders: Order[]) =>
    ({ type: POS_ORDERS_FETCHED, payload: { orders } } as const),
  orderStatusUpdated: (orderId: string, status: string) =>
    ({ type: POS_ORDER_STATUS_UPDATED, payload: { orderId, status } } as const),
  orderItemAdded: (item: MenuItem) =>
    ({ type: POS_ORDER_ITEM_ADDED, payload: { item } } as const),
  orderItemRemoved: (itemId: string) =>
    ({ type: POS_ORDER_ITEM_REMOVED, payload: { itemId } } as const),
  orderItemQuantityUpdated: (itemId: string, quantity: number) =>
    ({ type: POS_ORDER_ITEM_QUANTITY_UPDATED, payload: { itemId, quantity } } as const),
  orderCustomerUpdated: (customerPhone: string) =>
    ({ type: POS_ORDER_CUSTOMER_UPDATED, payload: { customerPhone } } as const),
  orderTypeUpdated: (orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') =>
    ({ type: POS_ORDER_TYPE_UPDATED, payload: { orderType } } as const),
  orderNotesUpdated: (notes: string) =>
    ({ type: POS_ORDER_NOTES_UPDATED, payload: { notes } } as const),
  orderCleared: () =>
    ({ type: POS_ORDER_CLEARED } as const),

  // Payments
  paymentProcessed: (orderId: string, amount_usd: number, paymentMethod: string) =>
    ({ type: POS_PAYMENT_PROCESSED, payload: { orderId, amount_usd, paymentMethod } } as const),

  // Menu
  menuItemsFetched: (menuItems: MenuItem[]) =>
    ({ type: POS_MENU_ITEMS_FETCHED, payload: { menuItems } } as const),
  menuCategorySelected: (category: string) =>
    ({ type: POS_MENU_CATEGORY_SELECTED, payload: { category } } as const),
  menuSearchQueryUpdated: (query: string) =>
    ({ type: POS_MENU_SEARCH_QUERY_UPDATED, payload: { query } } as const),

  // Inventory
  inventoryFetched: (inventory: InventoryItem[]) =>
    ({ type: POS_INVENTORY_FETCHED, payload: { inventory } } as const),
  inventoryUpdated: (itemId: string, quantity: number) =>
    ({ type: POS_INVENTORY_UPDATED, payload: { itemId, quantity } } as const),

  // Navigation
  tabSelected: (tab: 'dashboard' | 'orders' | 'kitchen' | 'inventory' | 'settings') =>
    ({ type: POS_TAB_SELECTED, payload: { tab } } as const),

  // Restaurant
  restaurantSelected: (restaurantId: string, restaurantName: string) =>
    ({ type: POS_RESTAURANT_SELECTED, payload: { restaurantId, restaurantName } } as const),

  // Shift
  shiftOpened: (startingCash: number) =>
    ({ type: POS_SHIFT_OPENED, payload: { startingCash } } as const),
  shiftClosed: (actualCash: number, notes?: string) =>
    ({ type: POS_SHIFT_CLOSED, payload: { actualCash, notes } } as const),
  cashTransactionAdded: (transaction: CashTransaction) =>
    ({ type: POS_CASH_TRANSACTION_ADDED, payload: { transaction } } as const)
};

export function posReducer(state: PosState = initialState, action: AnyAction): PosState {
  switch (action.type) {
    // Sync
    case POS_SYNC_STARTED:
      return { ...state, lastSyncStatus: 'SYNCING' };
    case POS_SYNC_FINISHED:
      return { ...state, lastSyncStatus: 'SYNCED', pendingSyncCount: 0 };
    case POS_SYNC_FAILED:
      return { ...state, lastSyncStatus: 'FAILED' };
    case POS_SYNC_PROGRESS:
      return { ...state }; // Could show progress in UI
    case POS_PENDING_SYNC_UPDATED:
      return { ...state, pendingSyncCount: action.payload.count };
    case POS_NETWORK_STATUS_CHANGED:
      return { ...state, isConnected: action.payload.isConnected };
    case POS_CONFLICT_DETECTED:
      return { ...state, showConflictModal: true, conflicts: action.payload.conflicts };
    case POS_CONFLICT_RESOLVED:
      return { ...state, showConflictModal: false, conflicts: [] };

    // Orders
    case POS_ORDER_CREATED: {
      const order = action.payload.order as Order;
      let newInventory = [...state.inventory];

      // Automatically deduct inventory based on recipes
      order.items_json && JSON.parse(order.items_json).forEach((item: any) => {
        const menuItem = state.menuItems.find(m => m.itemId === item.itemId);
        if (menuItem && menuItem.recipe_json) {
          const recipe = JSON.parse(menuItem.recipe_json);
          recipe.forEach((ingredient: { inventoryItemId: string, quantity: number }) => {
            const invItemIndex = newInventory.findIndex(i => i.itemId === ingredient.inventoryItemId);
            if (invItemIndex > -1) {
              newInventory[invItemIndex] = {
                ...newInventory[invItemIndex],
                quantity: newInventory[invItemIndex].quantity - (ingredient.quantity * item.quantity)
              };
            }
          });
        }
      });

      return {
        ...state,
        orders: [order, ...state.orders],
        currentOrder: { items: [], orderType: 'DINE_IN' },
        inventory: newInventory
      };
    }
    case POS_ORDERS_FETCHED:
      return { ...state, orders: action.payload.orders };
    case POS_ORDER_STATUS_UPDATED:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.orderId === action.payload.orderId ? { ...order, status: action.payload.status } : order
        )
      };
    case POS_ORDER_ITEM_ADDED: {
      const item = action.payload.item as MenuItem;
      const existingItem = state.currentOrder.items.find(i => i.itemId === item.itemId);

      if (existingItem) {
        return {
          ...state,
          currentOrder: {
            ...state.currentOrder,
            items: state.currentOrder.items.map(i =>
              i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i
            )
          }
        };
      } else {
        return {
          ...state,
          currentOrder: {
            ...state.currentOrder,
            items: [...state.currentOrder.items, {
              itemId: item.itemId,
              name: item.name,
              name_ar: item.name_ar,
              quantity: 1,
              price_usd: item.price_usd,
              price_local: item.price_local
            }]
          }
        };
      }
    }
    case POS_ORDER_ITEM_REMOVED:
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.filter(i => i.itemId !== action.payload.itemId)
        }
      };
    case POS_ORDER_ITEM_QUANTITY_UPDATED:
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.map(i =>
            i.itemId === action.payload.itemId ? { ...i, quantity: action.payload.quantity } : i
          ).filter(i => i.quantity > 0)
        }
      };
    case POS_ORDER_CUSTOMER_UPDATED:
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          customerPhone: action.payload.customerPhone
        }
      };
    case POS_ORDER_TYPE_UPDATED:
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          orderType: action.payload.orderType
        }
      };
    case POS_ORDER_NOTES_UPDATED:
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          notes: action.payload.notes
        }
      };
    case POS_ORDER_CLEARED:
      return {
        ...state,
        currentOrder: { items: [], orderType: 'DINE_IN' }
      };

    // Menu
    case POS_MENU_ITEMS_FETCHED:
      return { ...state, menuItems: action.payload.menuItems };
    case POS_MENU_CATEGORY_SELECTED:
      return { ...state, selectedCategory: action.payload.category };
    case POS_MENU_SEARCH_QUERY_UPDATED:
      return { ...state, searchQuery: action.payload.query };

    // Inventory
    case POS_INVENTORY_FETCHED:
      return { ...state, inventory: action.payload.inventory };
    case POS_INVENTORY_UPDATED:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.itemId === action.payload.itemId ? { ...item, quantity: action.payload.quantity } : item
        )
      };

    // Navigation
    case POS_TAB_SELECTED:
      return { ...state, activeTab: action.payload.tab };

    // Restaurant
    case POS_RESTAURANT_SELECTED:
      return {
        ...state,
        restaurantName: action.payload.restaurantName
      };

    // Shift
    case POS_SHIFT_OPENED:
      return {
        ...state,
        shift: {
          shiftId: `shift_${Date.now()}`,
          startTime: new Date().toISOString(),
          startingCash: action.payload.startingCash,
          expectedCash: action.payload.startingCash,
          status: 'OPEN',
          cashTransactions: []
        }
      };
    case POS_SHIFT_CLOSED:
      if (!state.shift) return state;
      return {
        ...state,
        shift: {
          ...state.shift,
          endTime: new Date().toISOString(),
          actualCash: action.payload.actualCash,
          status: 'CLOSED'
        }
      };
    case POS_CASH_TRANSACTION_ADDED:
      if (!state.shift) return state;
      const amountChange = action.payload.transaction.type === 'IN' ? action.payload.transaction.amount : -action.payload.transaction.amount;
      return {
        ...state,
        shift: {
          ...state.shift,
          expectedCash: state.shift.expectedCash + amountChange,
          cashTransactions: [...state.shift.cashTransactions, action.payload.transaction]
        }
      };

    // Handle Cash Sales
    case POS_PAYMENT_PROCESSED: // Update shift if cash payment
      if (state.shift && action.payload.paymentMethod === 'CASH') {
        return {
          ...state,
          shift: {
            ...state.shift,
            expectedCash: state.shift.expectedCash + action.payload.amount_usd
          }
        };
      }
      return state;

    default:
      return state;
  }
}
