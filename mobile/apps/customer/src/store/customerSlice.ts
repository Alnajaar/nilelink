import type { AnyAction } from 'redux';

export interface CustomerState {
  isLoggedIn: boolean;
  currentUser: {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    language: 'en' | 'ar';
  } | null;
  cart: CartItem[];
  orders: Order[];
  favoriteRestaurants: string[];
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  isConnected: boolean;
  lastSyncStatus: 'IDLE' | 'SYNCING' | 'SYNCED' | 'FAILED';
  pendingSyncCount: number;
}

export interface CartItem {
  id: string;
  name: string;
  name_ar?: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  notes?: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress?: string;
  paymentMethod: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

const initialState: CustomerState = {
  isLoggedIn: false,
  currentUser: null,
  cart: [],
  orders: [],
  favoriteRestaurants: [],
  notificationsEnabled: true,
  biometricEnabled: true,
  isConnected: true,
  lastSyncStatus: 'IDLE',
  pendingSyncCount: 0
};

// Actions
export const CUSTOMER_LOGIN = 'customer/LOGIN';
export const CUSTOMER_LOGOUT = 'customer/LOGOUT';
export const CUSTOMER_UPDATE_PROFILE = 'customer/UPDATE_PROFILE';
export const CUSTOMER_CART_ADD_ITEM = 'customer/CART_ADD_ITEM';
export const CUSTOMER_CART_REMOVE_ITEM = 'customer/CART_REMOVE_ITEM';
export const CUSTOMER_CART_UPDATE_QUANTITY = 'customer/CART_UPDATE_QUANTITY';
export const CUSTOMER_CART_CLEAR = 'customer/CART_CLEAR';
export const CUSTOMER_ORDERS_FETCHED = 'customer/ORDERS_FETCHED';
export const CUSTOMER_ORDER_CREATED = 'customer/ORDER_CREATED';
export const CUSTOMER_ORDER_UPDATED = 'customer/ORDER_UPDATED';
export const CUSTOMER_TOGGLE_FAVORITE = 'customer/TOGGLE_FAVORITE';
export const CUSTOMER_NOTIFICATIONS_TOGGLED = 'customer/NOTIFICATIONS_TOGGLED';
export const CUSTOMER_BIOMETRIC_TOGGLED = 'customer/BIOMETRIC_TOGGLED';
export const CUSTOMER_NETWORK_STATUS_CHANGED = 'customer/NETWORK_STATUS_CHANGED';
export const CUSTOMER_SYNC_STATUS_CHANGED = 'customer/SYNC_STATUS_CHANGED';
export const CUSTOMER_PENDING_SYNC_UPDATED = 'customer/PENDING_SYNC_UPDATED';

export const customerActions = {
  login: (user: CustomerState['currentUser']) => 
    ({ type: CUSTOMER_LOGIN, payload: { user } } as const),
  logout: () => 
    ({ type: CUSTOMER_LOGOUT } as const),
  updateProfile: (updates: Partial<NonNullable<CustomerState['currentUser']>>) => 
    ({ type: CUSTOMER_UPDATE_PROFILE, payload: { updates } } as const),
  addToCart: (item: Omit<CartItem, 'quantity'>) => 
    ({ type: CUSTOMER_CART_ADD_ITEM, payload: { item } } as const),
  removeFromCart: (itemId: string) => 
    ({ type: CUSTOMER_CART_REMOVE_ITEM, payload: { itemId } } as const),
  updateCartQuantity: (itemId: string, quantity: number) => 
    ({ type: CUSTOMER_CART_UPDATE_QUANTITY, payload: { itemId, quantity } } as const),
  clearCart: () => 
    ({ type: CUSTOMER_CART_CLEAR } as const),
  ordersFetched: (orders: Order[]) => 
    ({ type: CUSTOMER_ORDERS_FETCHED, payload: { orders } } as const),
  orderCreated: (order: Order) => 
    ({ type: CUSTOMER_ORDER_CREATED, payload: { order } } as const),
  orderUpdated: (orderId: string, status: Order['status']) => 
    ({ type: CUSTOMER_ORDER_UPDATED, payload: { orderId, status } } as const),
  toggleFavorite: (restaurantId: string) => 
    ({ type: CUSTOMER_TOGGLE_FAVORITE, payload: { restaurantId } } as const),
  toggleNotifications: (enabled: boolean) => 
    ({ type: CUSTOMER_NOTIFICATIONS_TOGGLED, payload: { enabled } } as const),
  toggleBiometric: (enabled: boolean) => 
    ({ type: CUSTOMER_BIOMETRIC_TOGGLED, payload: { enabled } } as const),
  networkStatusChanged: (isConnected: boolean) => 
    ({ type: CUSTOMER_NETWORK_STATUS_CHANGED, payload: { isConnected } } as const),
  syncStatusChanged: (status: CustomerState['lastSyncStatus']) => 
    ({ type: CUSTOMER_SYNC_STATUS_CHANGED, payload: { status } } as const),
  pendingSyncUpdated: (count: number) => 
    ({ type: CUSTOMER_PENDING_SYNC_UPDATED, payload: { count } } as const),
};

export function customerReducer(state: CustomerState = initialState, action: AnyAction): CustomerState {
  switch (action.type) {
    case CUSTOMER_LOGIN:
      return {
        ...state,
        isLoggedIn: true,
        currentUser: {
          ...action.payload.user,
          language: action.payload.user.language || 'en'
        }
      };

    case CUSTOMER_LOGOUT:
      return {
        ...initialState,
        notificationsEnabled: state.notificationsEnabled,
        biometricEnabled: state.biometricEnabled
      };

    case CUSTOMER_UPDATE_PROFILE:
      return {
        ...state,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          ...action.payload.updates
        } : null
      };

    case CUSTOMER_CART_ADD_ITEM: {
      const existingItem = state.cart.find(item => item.id === action.payload.item.id);
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.item.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { ...action.payload.item, quantity: 1 }]
        };
      }
    }

    case CUSTOMER_CART_REMOVE_ITEM:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload.itemId)
      };

    case CUSTOMER_CART_UPDATE_QUANTITY:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case CUSTOMER_CART_CLEAR:
      return {
        ...state,
        cart: []
      };

    case CUSTOMER_ORDERS_FETCHED:
      return {
        ...state,
        orders: action.payload.orders
      };

    case CUSTOMER_ORDER_CREATED:
      return {
        ...state,
        orders: [action.payload.order, ...state.orders],
        cart: [] // Clear cart after order
      };

    case CUSTOMER_ORDER_UPDATED:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.orderId === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };

    case CUSTOMER_TOGGLE_FAVORITE:
      return {
        ...state,
        favoriteRestaurants: state.favoriteRestaurants.includes(action.payload.restaurantId)
          ? state.favoriteRestaurants.filter(id => id !== action.payload.restaurantId)
          : [...state.favoriteRestaurants, action.payload.restaurantId]
      };

    case CUSTOMER_NOTIFICATIONS_TOGGLED:
      return {
        ...state,
        notificationsEnabled: action.payload.enabled
      };

    case CUSTOMER_BIOMETRIC_TOGGLED:
      return {
        ...state,
        biometricEnabled: action.payload.enabled
      };

    case CUSTOMER_NETWORK_STATUS_CHANGED:
      return {
        ...state,
        isConnected: action.payload.isConnected
      };

    case CUSTOMER_SYNC_STATUS_CHANGED:
      return {
        ...state,
        lastSyncStatus: action.payload.status
      };

    case CUSTOMER_PENDING_SYNC_UPDATED:
      return {
        ...state,
        pendingSyncCount: action.payload.count
      };

    default:
      return state;
  }
}