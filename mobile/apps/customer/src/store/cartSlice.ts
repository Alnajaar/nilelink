import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string;
    menuItem: {
        id: string;
        name: string;
        image: string;
        category: string;
    };
    quantity: number;
    customizations: { [key: string]: string[] };
    specialInstructions?: string;
    totalPrice: number;
}

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
}

const initialState: CartState = {
    items: [],
    total: 0,
    itemCount: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItemIndex = state.items.findIndex(
                item => item.id === action.payload.id
            );

            if (existingItemIndex >= 0) {
                // Update existing item
                state.items[existingItemIndex].quantity += action.payload.quantity;
                state.items[existingItemIndex].totalPrice += action.payload.totalPrice;
            } else {
                // Add new item
                state.items.push(action.payload);
            }

            // Recalculate totals
            state.total = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
            state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        },
        updateCartItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const itemIndex = state.items.findIndex(item => item.id === action.payload.id);

            if (itemIndex >= 0) {
                if (action.payload.quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    state.items.splice(itemIndex, 1);
                } else {
                    state.items[itemIndex].quantity = action.payload.quantity;
                    // Recalculate price based on quantity
                    const unitPrice = state.items[itemIndex].totalPrice / state.items[itemIndex].quantity;
                    state.items[itemIndex].totalPrice = unitPrice * action.payload.quantity;
                }

                // Recalculate totals
                state.total = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
                state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);

            // Recalculate totals
            state.total = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
            state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        },
        clearCart: (state) => {
            state.items = [];
            state.total = 0;
            state.itemCount = 0;
        },
    },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;