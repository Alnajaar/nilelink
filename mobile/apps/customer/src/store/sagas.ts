import { put, takeLatest } from 'redux-saga/effects';
import { createMagicWalletStub } from '@nilelink/mobile-blockchain';
import { CUSTOMER_PLACE_ORDER_REQUESTED, customerActions } from './customerSlice';

const wallet = createMagicWalletStub();

export function* rootSaga() {
  yield takeLatest(CUSTOMER_PLACE_ORDER_REQUESTED, function* () {
    // v0.1 placeholder: real implementation will require online connectivity and USDC transfer
    const res = yield wallet.pay({
      amountUsd6: 10_00_000n,
      to: '0x0000000000000000000000000000000000000000',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      chainId: 137
    });

    yield put(customerActions.placeOrderConfirmed(res.txHash));
  });
}
