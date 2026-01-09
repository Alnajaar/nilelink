import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useSyncStatus } from '../hooks/useSyncStatus';

interface SyncStatusIndicatorProps {
  database?: any;
  onPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  database,
  onPress,
}) => {
  const { isOnline, pendingCount, isSyncing, errors, lastSyncTime } = useSyncStatus(database);

  const getStatusColor = () => {
    if (!isOnline) return '#ff6b6b';
    if (errors.length > 0) return '#ffa726';
    if (isSyncing) return '#42a5f5';
    if (pendingCount > 0) return '#ab47bc';
    return '#66bb6a';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (errors.length > 0) return 'Error';
    if (isSyncing) return 'Syncing...';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]}>
        {!isOnline ? (
          <Text style={styles.icon}>📶</Text>
        ) : isSyncing ? (
          <ActivityIndicator size="small" color="white" />
        ) : errors.length > 0 ? (
          <Text style={styles.icon}>⚠️</Text>
        ) : pendingCount > 0 ? (
          <Text style={styles.icon}>⏳</Text>
        ) : (
          <Text style={styles.icon}>✅</Text>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.lastSyncText}>
          Last sync: {getLastSyncText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
  },
});