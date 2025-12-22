import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { PosState } from '../store/posSlice';
import { posActions } from '../store/posSlice';

export function POSHomeScreen() {
  const dispatch = useDispatch();
  const pendingSyncCount = useSelector<{ pos: PosState }, number>((s) => s.pos.pendingSyncCount);
  const lastSyncStatus = useSelector<{ pos: PosState }, PosState['lastSyncStatus']>((s) => s.pos.lastSyncStatus);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>NileLink POS</Text>

      {pendingSyncCount > 0 ? (
        <View style={{ padding: 12, backgroundColor: '#fff3cd', borderRadius: 8 }}>
          <Text style={{ fontSize: 14 }}>⚠️ {pendingSyncCount} orders waiting to sync</Text>
        </View>
      ) : (
        <View style={{ padding: 12, backgroundColor: '#e7f5ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 14 }}>Last sync: {lastSyncStatus}</Text>
        </View>
      )}

      <Pressable
        onPress={() => dispatch(posActions.syncRequested())}
        style={{ backgroundColor: '#0b5ed7', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>Sync now</Text>
      </Pressable>

      <Pressable style={{ backgroundColor: '#198754', padding: 14, borderRadius: 10 }}>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>New Order</Text>
      </Pressable>

      <Pressable style={{ backgroundColor: '#0dcaf0', padding: 14, borderRadius: 10 }}>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>Kitchen Display</Text>
      </Pressable>

      <Pressable style={{ backgroundColor: '#dc3545', padding: 14, borderRadius: 10 }}>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>Inventory</Text>
      </Pressable>
    </View>
  );
}
