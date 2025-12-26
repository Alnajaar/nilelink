import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    restaurant: {
        id: string;
        name: string;
        address: string;
        phone: string;
    };
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        customizations?: any[];
    }>;
    total: number;
    createdAt: string;
    estimatedDelivery: Date;
}

interface OrderState {
    currentOrder: Order | null;
    orders: Order[];
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    currentOrder: null,
    orders: [],
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        loadOrderStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadOrderSuccess: (state, action: PayloadAction<Order>) => {
            state.currentOrder = action.payload;
            state.loading = false;
        },
        loadOrderFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
            if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
                state.currentOrder.status = action.payload.status;
            }
        },
        rateOrder: (state, action: PayloadAction<{
            orderId: string;
            driverRating: number;
            foodRating: number;
            review: string;
        }>) => {
            // Handle rating submission
            if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
                // Could add rating data to order
            }
        },
        reorderItems: (state, action: PayloadAction<any[]>) => {
            // Handle reordering items to cart
            // This would typically dispatch actions to the cart slice
        },
        loadOrdersHistoryStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadOrdersHistorySuccess: (state, action: PayloadAction<Order[]>) => {
            state.orders = action.payload;
            state.loading = false;
        },
        loadOrdersHistoryFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    loadOrderStart,
    loadOrderSuccess,
    loadOrderFailure,
    updateOrderStatus,
    rateOrder,
    reorderItems,
    loadOrdersHistoryStart,
    loadOrdersHistorySuccess,
    loadOrdersHistoryFailure,
} = orderSlice.actions;

export default orderSlice.reducer;