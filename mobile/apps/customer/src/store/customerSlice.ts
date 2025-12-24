import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image?: string;
  isOpen: boolean;
  distance: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
  modifiers?: Array<{
    id: string;
    name: string;
    price: number;
    selected: boolean;
  }>;
}

export interface Order {
  id: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'delivered';
  date: string;
}

export interface CustomerState {
  user: UserProfile | null;
  currentRestaurant: Restaurant | null;
  cart: {
    restaurantId: string | null;
    items: CartItem[];
  };
  activeOrders: Order[];
  restaurants: Restaurant[];
}

const initialState: CustomerState = {
  user: {
    name: 'Ahmed Mohamed',
    phone: '+20 123 456 7890',
    email: 'ahmed@example.com'
  },
  currentRestaurant: null,
  cart: {
    restaurantId: null,
    items: [],
  },
  activeOrders: [],
  restaurants: [], // In a real app, this would be fetched
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setRestaurants(state, action: PayloadAction<Restaurant[]>) {
      state.restaurants = action.payload;
    },
    setRestaurant(state, action: PayloadAction<Restaurant>) {
      state.currentRestaurant = action.payload;
    },
    addToCart(state, action: PayloadAction<{ restaurantId: string; item: CartItem }>) {
      const { restaurantId, item } = action.payload;

      // Check if adding from a different restaurant
      if (state.cart.restaurantId && state.cart.restaurantId !== restaurantId) {
        // For simplicity, we'll just clear the cart if switching restaurants or handle via UI confirmation
        // Here we'll just overwrite for now, or we could throw error/alert in UI
        state.cart.items = [];
        state.cart.restaurantId = restaurantId;
      }

      state.cart.restaurantId = restaurantId;

      const existingItem = state.cart.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.cart.items.push(item);
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart.items = state.cart.items.filter(i => i.id !== action.payload);
      if (state.cart.items.length === 0) {
        state.cart.restaurantId = null;
      }
    },
    updateCartQuantity(state, action: PayloadAction<{ itemId: string; quantity: number }>) {
      const item = state.cart.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cart.items = state.cart.items.filter(i => i.id !== action.payload.itemId);
        }
      }
      if (state.cart.items.length === 0) {
        state.cart.restaurantId = null;
      }
    },
    clearCart(state) {
      state.cart.items = [];
      state.cart.restaurantId = null;
    },
    createOrder(state, action: PayloadAction<Order>) {
      state.activeOrders.push(action.payload);
      state.cart.items = [];
      state.cart.restaurantId = null;
    },
    updateOrderStatus(state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) {
      const order = state.activeOrders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    }
  },
});

export const customerActions = customerSlice.actions;
export const customerReducer = customerSlice.reducer;