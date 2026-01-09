import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime?: Date;
  isSyncing: boolean;
  errors: string[];
}

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  onRetrySync?: () => void;
  onViewQueue?: () => void;
  style?: any;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  onRetrySync,
  onViewQueue,
  style
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (!status.isOnline) return '#ef4444'; // red
    if (status.errors.length > 0) return '#f59e0b'; // amber
    if (status.isSyncing) return '#3b82f6'; // blue
    if (status.pendingCount > 0) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return 'cloud-offline';
    if (status.errors.length > 0) return 'alert-circle';
    if (status.isSyncing) return 'sync';
    if (status.pendingCount > 0) return 'clock-outline';
    return 'cloud-check';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.errors.length > 0) return 'Sync Error';
    if (status.isSyncing) return 'Syncing...';
    if (status.pendingCount > 0) return `${status.pendingCount} Pending`;
    return 'Synced';
  };

  return (
    <>
      <TouchableOpacity
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }, style]}
        onPress={() => setShowDetails(true)}
      >
        <MaterialCommunityIcons
          name={getStatusIcon() as any}
          size={16}
          color={getStatusColor()}
          style={{ marginRight: 6 }}
        />
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: getStatusColor(),
        }}>
          {getStatusText()}
        </Text>
        {(status.pendingCount > 0 || status.errors.length > 0) && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#ef4444',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {status.errors.length > 0 ? '!' : status.pendingCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '70%',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                Sync Status
              </Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <MaterialCommunityIcons
                  name={getStatusIcon() as any}
                  size={20}
                  color={getStatusColor()}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
                  {getStatusText()}
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                  Connection: {status.isOnline ? 'Online' : 'Offline'}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                  Pending Operations: {status.pendingCount}
                </Text>
                {status.lastSyncTime && (
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    Last Sync: {status.lastSyncTime.toLocaleString()}
                  </Text>
                )}
              </View>

              {status.errors.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', marginBottom: 8 }}>
                    Sync Errors
                  </Text>
                  {status.errors.map((error, index) => (
                    <Text key={index} style={{
                      fontSize: 12,
                      color: '#dc2626',
                      marginBottom: 4,
                      padding: 8,
                      backgroundColor: '#fef2f2',
                      borderRadius: 4
                    }}>
                      {error}
                    </Text>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                {status.pendingCount > 0 && onViewQueue && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowDetails(false);
                      onViewQueue();
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                      View Queue
                    </Text>
                  </TouchableOpacity>
                )}

                {(status.errors.length > 0 || (!status.isOnline && status.pendingCount > 0)) && onRetrySync && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#0e372b',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowDetails(false);
                      onRetrySync();
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Retry Sync
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SyncStatusIndicator;