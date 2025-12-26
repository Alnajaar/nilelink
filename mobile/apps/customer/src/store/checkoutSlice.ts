import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PromoCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed' | 'free_delivery';
    value: number;
    description: string;
    minimumOrder?: number;
    expiresAt?: string;
}

interface PaymentMethod {
    id: string;
    type: 'wallet' | 'card' | 'cash';
    name: string;
    lastFour?: string;
    balance?: number;
    isDefault: boolean;
}

interface CheckoutState {
    appliedPromoCode: PromoCode | null;
    deliveryAddress: {
        street: string;
        city: string;
        zipCode: string;
    } | null;
    selectedPaymentMethod: PaymentMethod | null;
    tipAmount: number;
    specialInstructions: string;
    isProcessing: boolean;
}

const initialState: CheckoutState = {
    appliedPromoCode: null,
    deliveryAddress: null,
    selectedPaymentMethod: null,
    tipAmount: 0,
    specialInstructions: '',
    isProcessing: false,
};

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        applyPromoCode: (state, action: PayloadAction<PromoCode>) => {
            state.appliedPromoCode = action.payload;
        },
        removePromoCode: (state) => {
            state.appliedPromoCode = null;
        },
        updateDeliveryAddress: (state, action: PayloadAction<CheckoutState['deliveryAddress']>) => {
            state.deliveryAddress = action.payload;
        },
        selectPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.selectedPaymentMethod = action.payload;
        },
        updateTipAmount: (state, action: PayloadAction<number>) => {
            state.tipAmount = action.payload;
        },
        updateSpecialInstructions: (state, action: PayloadAction<string>) => {
            state.specialInstructions = action.payload;
        },
        setProcessing: (state, action: PayloadAction<boolean>) => {
            state.isProcessing = action.payload;
        },
        clearCheckout: (state) => {
            state.appliedPromoCode = null;
            state.deliveryAddress = null;
            state.selectedPaymentMethod = null;
            state.tipAmount = 0;
            state.specialInstructions = '';
            state.isProcessing = false;
        },
    },
});

export const {
    applyPromoCode,
    removePromoCode,
    updateDeliveryAddress,
    selectPaymentMethod,
    updateTipAmount,
    updateSpecialInstructions,
    setProcessing,
    clearCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;