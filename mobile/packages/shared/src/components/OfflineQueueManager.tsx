import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface QueueItem {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

interface OfflineQueueManagerProps {
  queueItems: QueueItem[];
  onRetryItem?: (itemId: string) => void;
  onRemoveItem?: (itemId: string) => void;
  onRetryAll?: () => void;
  onClearCompleted?: () => void;
  isOnline: boolean;
}

export const OfflineQueueManager: React.FC<OfflineQueueManagerProps> = ({
  queueItems,
  onRetryItem,
  onRemoveItem,
  onRetryAll,
  onClearCompleted,
  isOnline
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b'; // amber
      case 'syncing': return '#3b82f6'; // blue
      case 'failed': return '#ef4444'; // red
      case 'completed': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'syncing': return 'sync';
      case 'failed': return 'alert-circle';
      case 'completed': return 'checkmark-circle';
      default: return 'circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'syncing': return 'Syncing';
      case 'failed': return 'Failed';
      case 'completed': return 'Synced';
      default: return 'Unknown';
    }
  };

  const handleRetryItem = (itemId: string) => {
    Alert.alert(
      'Retry Operation',
      'Retry this sync operation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => onRetryItem?.(itemId) }
      ]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Operation',
      'Remove this item from the sync queue? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveItem?.(itemId) }
      ]
    );
  };

  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const renderQueueItem = ({ item }: { item: QueueItem }) => (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={20}
            color={getStatusColor(item.status)}
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
            }}>
              {item.type}
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#6b7280',
            }}>
              {item.entityType} • {item.entityId.slice(0, 8)}...
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            fontSize: 12,
            color: getStatusColor(item.status),
            fontWeight: '600',
            marginRight: 8,
          }}>
            {getStatusText(item.status)}
          </Text>

          {item.retryCount > 0 && (
            <Text style={{
              fontSize: 10,
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              marginRight: 8,
            }}>
              {item.retryCount}/{item.maxRetries}
            </Text>
          )}
        </View>
      </View>

      <Text style={{
        fontSize: 12,
        color: '#6b7280',
        marginBottom: item.error ? 8 : 0,
      }}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>

      {item.error && (
        <Text style={{
          fontSize: 12,
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          padding: 8,
          borderRadius: 4,
          marginBottom: 8,
        }}>
          {item.error}
        </Text>
      )}

      {item.status === 'failed' && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {onRetryItem && (
            <TouchableOpacity
              style={{
                backgroundColor: '#f59e0b',
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => handleRetryItem(item.id)}
            >
              <Ionicons name="refresh" size={14} color="white" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                Retry
              </Text>
            </TouchableOpacity>
          )}

          {onRemoveItem && (
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Ionicons name="trash" size={14} color="white" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const pendingItems = queueItems.filter(item => item.status !== 'completed');
  const completedItems = queueItems.filter(item => item.status === 'completed');
  const failedItems = queueItems.filter(item => item.status === 'failed');

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 4,
        }}>
          Sync Queue
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6b7280',
        }}>
          {isOnline ? 'Online - Auto-syncing' : 'Offline - Will sync when connected'}
        </Text>
      </View>

      {/* Queue Summary */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>
            {pendingItems.length}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Pending</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>
            {failedItems.length}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Failed</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>
            {completedItems.length}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Completed</Text>
        </View>
      </View>

      {/* Bulk Actions */}
      {(failedItems.length > 0 || pendingItems.length > 0) && (
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
        }}>
          {failedItems.length > 0 && onRetryAll && (
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#f59e0b',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={() => {
                Alert.alert(
                  'Retry All Failed',
                  'Retry all failed sync operations?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Retry All', onPress: onRetryAll }
                  ]
                );
              }}
            >
              <Ionicons name="refresh" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Retry Failed
              </Text>
            </TouchableOpacity>
          )}

          {completedItems.length > 0 && onClearCompleted && (
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              onPress={() => {
                Alert.alert(
                  'Clear Completed',
                  'Remove all completed items from the queue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', onPress: onClearCompleted }
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Clear Completed
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Queue Items */}
      <FlatList
        data={queueItems}
        renderItem={renderQueueItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={48}
              color="#10b981"
              style={{ marginBottom: 16 }}
            />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 8,
            }}>
              All Synced!
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              All your operations are synchronized.{'\n'}You're all caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default OfflineQueueManager;