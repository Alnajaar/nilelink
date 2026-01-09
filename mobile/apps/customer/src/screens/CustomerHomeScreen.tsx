import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStatus } from '@nilelink/sync-engine/hooks/useSyncStatus';
import { CustomerDatabase, initializeDatabase } from '../services/database';
import type { CustomerState } from '../store/customerSlice';
import { customerActions } from '../store/customerSlice';

export function CustomerHomeScreen() {
  const dispatch = useDispatch();
  const [database, setDatabase] = useState<CustomerDatabase | null>(null);
  const syncStatus = useSyncStatus(database);

  const user = useSelector((state: { customer: CustomerState }) => state.customer.user);
  const cart = useSelector((state: { customer: CustomerState }) => state.customer.cart);

  useEffect(() => {
    initializeDatabase().then(setDatabase);
  }, []);

  const SyncStatusIndicator = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: syncStatus.isOnline ? '#E6F7F0' : '#FEF2F2',
      borderRadius: 8,
      marginBottom: 12
    }}>
      <View style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: syncStatus.isOnline ? '#00C389' : '#DC2626',
        marginRight: 8
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: syncStatus.isOnline ? '#064E3B' : '#7F1D1D'
        }}>
          {syncStatus.isOnline ? 'Online' : 'Offline'}
          {syncStatus.isSyncing && ' (Syncing...)'}
        </Text>
        <Text style={{
          fontSize: 12,
          color: syncStatus.isOnline ? '#0c5460' : '#721c24'
        }}>
          {syncStatus.pendingCount > 0
            ? `${syncStatus.pendingCount} items pending sync`
            : 'All data synchronized'
          }
        </Text>
      </View>
      {syncStatus.isSyncing && (
        <ActivityIndicator size="small" color={syncStatus.isOnline ? '#17a2b8' : '#dc3545'} />
      )}
    </View>
  );

  const SyncErrorIndicator = () => (
    syncStatus.errors.length > 0 && (
      <View style={{
        padding: 12,
        backgroundColor: '#f8d7da',
        borderRadius: 8,
        marginBottom: 12
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#721c24',
          marginBottom: 4
        }}>
          Sync Errors
        </Text>
        {syncStatus.errors.slice(0, 2).map((error: string, index: number) => (
          <Text key={index} style={{
            fontSize: 12,
            color: '#721c24',
            marginBottom: 2
          }}>
            • {error}
          </Text>
        ))}
        <TouchableOpacity
          onPress={() => syncStatus.retrySync()}
          style={{
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: '#dc3545',
            borderRadius: 6,
            alignSelf: 'flex-start'
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontWeight: '600'
          }}>
            Retry Sync
          </Text>
        </TouchableOpacity>
      </View>
    )
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>NileLink</Text>

      <SyncStatusIndicator />
      <SyncErrorIndicator />

      <Pressable
        onPress={() => dispatch(customerActions.clearCart())}
        style={{ backgroundColor: '#0dcaf0', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
          Clear Cart ({cart.items.length} items)
        </Text>
      </Pressable>

      <Pressable
        onPress={() => dispatch(customerActions.setRestaurants([]))}
        style={{
          backgroundColor: '#00C389',
          padding: 14,
          borderRadius: 10
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
          Load Restaurants
        </Text>
      </Pressable>

      {user && (
        <View style={{ padding: 12, backgroundColor: '#e7f5ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Welcome, {user.name}!</Text>
          <Text style={{ fontSize: 12, color: '#495057' }}>{user.phone}</Text>
        </View>
      )}
    </View>
  );
}
