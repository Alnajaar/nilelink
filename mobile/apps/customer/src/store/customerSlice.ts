import type { AnyAction } from 'redux';

export type CustomerState = {
  online: boolean;
  lastOrderTxHash?: string;
};

const initialState: CustomerState = {
  online: true
};

export const CUSTOMER_ONLINE_CHANGED = 'customer/ONLINE_CHANGED';
export const CUSTOMER_PLACE_ORDER_REQUESTED = 'customer/PLACE_ORDER_REQUESTED';
export const CUSTOMER_PLACE_ORDER_CONFIRMED = 'customer/PLACE_ORDER_CONFIRMED';

export const customerActions = {
  onlineChanged: (online: boolean) => ({ type: CUSTOMER_ONLINE_CHANGED, payload: { online } } as const),
  placeOrderRequested: () => ({ type: CUSTOMER_PLACE_ORDER_REQUESTED } as const),
  placeOrderConfirmed: (txHash: string) =>
    ({ type: CUSTOMER_PLACE_ORDER_CONFIRMED, payload: { txHash } } as const)
};

export function customerReducer(state: CustomerState = initialState, action: AnyAction): CustomerState {
  switch (action.type) {
    case CUSTOMER_ONLINE_CHANGED:
      return { ...state, online: action.payload.online };
    case CUSTOMER_PLACE_ORDER_CONFIRMED:
      return { ...state, lastOrderTxHash: action.payload.txHash };
    default:
      return state;
  }
}
