import React, { useEffect } from 'react';
import { 
  View, Text, Pressable, ScrollView, StyleSheet, 
  Dimensions, Platform, SafeAreaView, StatusBar 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { posActions } from '../store/posSlice';
import { useNavigation } from '@react-navigation/native';
import type { PosState } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export function DashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const state = useSelector<{ pos: PosState }, PosState>(s => s.pos);
  
  const { pendingSyncCount, lastSyncStatus, isConnected, restaurantName } = state;
  
  useEffect(() => {
    // Load initial data
    // dispatch(actions.fetchTodaysMetrics());
    // dispatch(actions.fetchOrders());
  }, []);
  
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const metrics = [
    { 
      title: 'Orders Today', 
      value: '24', 
      change: '+12%', 
      positive: true,
      icon: 'restaurant-outline'
    },
    { 
      title: 'Revenue', 
      value: formatCurrency(485.50), 
      change: '+8.5%', 
      positive: true,
      icon: 'cash-outline'
    },
    { 
      title: 'Avg Order Time', 
      value: '12m', 
      change: '-2m', 
      positive: true,
      icon: 'timer-outline'
    },
    { 
      title: 'Satisfaction', 
      value: '4.8', 
      change: '+0.2', 
      positive: true,
      icon: 'star-outline'
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.restaurantName}>
            {restaurantName || 'Select Restaurant'}
          </Text>
          <Text style={styles.restaurantLocation}>Cairo, Egypt</Text>
        </View>
        
        <View style={styles.connectionStatus}>
          <Ionicons 
            name={isConnected ? 'wifi' : 'wifi-offline'} 
            size={20} 
            color={isConnected ? '#28a745' : '#dc3545'} 
          />
          {lastSyncStatus === 'SYNCING' && (
            <Ionicons 
              name="sync-outline" 
              size={20} 
              color="#0d6efd" 
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </View>
      
      {/* Sync Status */}
      {pendingSyncCount > 0 ? (
        <View style={[styles.syncBanner, styles.syncWarning]}>
          <Ionicons name="cloud-offline-outline" size={20} color="#856404" />
          <Text style={styles.syncText}>📡 Offline - {pendingSyncCount} order{pendingSyncCount > 1 ? 's' : ''} queued</Text>
          <Pressable onPress={() => dispatch(posActions.syncRequested())} style={styles.syncButton}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.syncBanner, styles.syncSuccess]}>
          <Ionicons name="cloud-done-outline" size={20} color="#155724" />
          <Text style={styles.syncText}>✓ All data synced</Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {/* Today's Metrics */}
        <Text style={styles.sectionTitle}>Today's Performance</Text>
        
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={[styles.metricCard, { backgroundColor: '#fff' }]}>
              <View style={styles.metricHeader}>
                <Ionicons name={metric.icon as any} size={24} color="#6c757d" />
                <Text style={[styles.metricChange, { color: metric.positive ? '#28a745' : '#dc3545' }]}>
                  {metric.change}
                </Text>
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </View>
          ))}
        </View>
        
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <Pressable 
            style={[styles.actionCard, styles.actionPrimary]}
            onPress={() => navigation.navigate('NewOrder' as never)}
          >
            <Ionicons name="add-circle-outline" size={32} color="#fff" />
            <Text style={styles.actionTitle}>New Order</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionCard, styles.actionSecondary]}
            onPress={() => navigation.navigate('KitchenDisplay' as never)}
          >
            <Ionicons name="fast-food-outline" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Kitchen Display</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionCard, styles.actionSecondary]}
            onPress={() => navigation.navigate('Inventory' as never)}
          >
            <Ionicons name="cube-outline" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Inventory</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionCard, styles.actionSecondary]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings-outline" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Settings</Text>
          </Pressable>
        </View>
        
        {/* Recent Orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        
        <View style={styles.recentOrdersCard}>
          <View style={styles.orderRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#ORD-001</Text>
              <Text style={styles.orderCustomer}>Ahmed M.</Text>
            </View>
            <View style={styles.orderStatus}>
              <Text style={styles.orderAmount}>$24.50</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Cooking</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.orderRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#ORD-002</Text>
              <Text style={styles.orderCustomer}>Sarah K.</Text>
            </View>
            <View style={styles.orderStatus}>
              <Text style={styles.orderAmount}>$18.75</Text>
              <View style={[styles.statusBadge, styles.statusReady]}>
                <Text style={styles.statusText}>Ready</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerLeft: {
    flex: 1
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529'
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  syncWarning: {
    backgroundColor: '#fff3cd'
  },
  syncSuccess: {
    backgroundColor: '#d4edda'
  },
  syncText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0d6efd',
    borderRadius: 6
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    marginTop: 8
  },
  metricsGrid: {
    flexDirection: isTablet ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  metricCard: {
    flex: 1,
    minWidth: isTablet ? '48%' : '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600'
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4
  },
  metricTitle: {
    fontSize: 14,
    color: '#6c757d'
  },
  actionsGrid: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 12,
    marginBottom: 24
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center'
  },
  actionPrimary: {
    backgroundColor: '#198754'
  },
  actionSecondary: {
    backgroundColor: '#6c757d'
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8
  },
  recentOrdersCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4'
  },
  orderInfo: {
    flex: 1
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  orderCustomer: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2
  },
  orderStatus: {
    alignItems: 'flex-end'
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529'
  },
  statusBadge: {
    backgroundColor: '#fd7e14',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4
  },
  statusReady: {
    backgroundColor: '#28a745'
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  }
});