import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { CustomerState } from '../store/customerSlice';
import { customerActions } from '../store/customerSlice';

export function CustomerHomeScreen() {
  const dispatch = useDispatch();
  const online = useSelector<{ customer: CustomerState }, boolean>((s) => s.customer.online);
  const lastOrderTxHash = useSelector<{ customer: CustomerState }, string | undefined>(
    (s) => s.customer.lastOrderTxHash
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>NileLink</Text>
      <Text style={{ fontSize: 14 }}>Mode: {online ? 'Online' : 'Offline'}</Text>

      <Pressable
        onPress={() => dispatch(customerActions.onlineChanged(!online))}
        style={{ backgroundColor: '#0dcaf0', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
          Toggle Online/Offline
        </Text>
      </Pressable>

      <Pressable
        onPress={() => dispatch(customerActions.placeOrderRequested())}
        disabled={!online}
        style={{
          backgroundColor: online ? '#198754' : '#adb5bd',
          padding: 14,
          borderRadius: 10
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
          Place Order & Pay
        </Text>
      </Pressable>

      {lastOrderTxHash ? (
        <View style={{ padding: 12, backgroundColor: '#e7f5ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 14 }}>Last tx: {lastOrderTxHash}</Text>
        </View>
      ) : null}

      {!online ? (
        <View style={{ padding: 12, backgroundColor: '#fff3cd', borderRadius: 8 }}>
          <Text style={{ fontSize: 14 }}>
            Offline: you can browse cached menus, but placing orders requires internet.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
