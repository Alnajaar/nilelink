import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Dimensions, Platform, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { posActions } from '../store/posSlice';
import type { PosState, Order } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const isLargeTablet = Math.min(width, height) >= 768;

// Enable audio for notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type OrderStatus = 'NEW' | 'COOKING' | 'READY' | 'DELIVERED';

export function KitchenDisplayScreen() {
  const dispatch = useDispatch();
  const { orders } = useSelector<{ pos: PosState }, PosState>(s => s.pos);
  const [settingsModal, setSettingsModal] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [volume, setVolume] = useState(0.7);
  const soundRef = useRef<any>(null);

  // Initialize audio
  useEffect(() => {
    loadSound();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play sound when new orders arrive
  useEffect(() => {
    const newOrders = orders.filter(o => o.status === 'CREATED');
    if (newOrders.length > 0) {
      playNewOrderSound();
    }
  }, [orders]);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/bell.mp3'),
        { volume: volume }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log('Could not load sound:', error);
    }
  };

  const playNewOrderSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log('Could not play sound:', error);
    }
  };

  const ordersByStatus = {
    NEW: orders.filter(o => o.status === 'CREATED' || o.status === 'PAID'),
    COOKING: orders.filter(o => o.status === 'CONFIRMED' || o.status === 'COOKING'),
    READY: orders.filter(o => o.status === 'READY'),
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').slice(0, 10) // Show last 10 delivered
  };

  const getOrderNumber = (order: Order) => {
    return `#${order.orderId.substr(order.orderId.length - 4).toUpperCase()}`;
  };

  const getTimeInKitchen = (order: Order) => {
    const created = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - created) / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return { backgroundColor: '#dc3545', textColor: '#fff' };
      case 'COOKING':
        return { backgroundColor: '#fd7e14', textColor: '#fff' };
      case 'READY':
        return { backgroundColor: '#28a745', textColor: '#fff' };
      case 'DELIVERED':
        return { backgroundColor: '#6c757d', textColor: '#fff' };
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'DINE_IN':
        return 'restaurant';
      case 'TAKEAWAY':
        return 'fast-food';
      case 'DELIVERY':
        return 'bicycle';
      default:
        return 'restaurant';
    }
  };

  const handleOrderAction = (order: Order, action: 'start' | 'mark_ready' | 'cancel') => {
    if (action === 'cancel') {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              dispatch(posActions.orderStatusUpdated(order.orderId, 'CANCELLED'));
            }
          }
        ]
      );
      return;
    }

    if (action === 'start') {
      dispatch(posActions.orderStatusUpdated(order.orderId, 'COOKING'));
    } else if (action === 'mark_ready') {
      dispatch(posActions.orderStatusUpdated(order.orderId, 'READY'));
    }
  };

  const handleArchiveComplete = () => {
    Alert.alert(
      'Archive Completed Orders',
      'Move all delivered orders to archive?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: () => {
          // In real app, move to archive database
          console.log('Archiving completed orders');
        }}
      ]
    );
  };

  const getFontSize = () => {
    switch (textSize) {
      case 'small':
        return { orderNumber: 24, itemText: 14, buttonText: 12 };
      case 'large':
        return { orderNumber: 36, itemText: 18, buttonText: 14 };
      default:
        return { orderNumber: 30, itemText: 16, buttonText: 13 };
    }
  };

  const fontSizes = getFontSize();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header - optimized for wall-mounted display */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Kitchen Display</Text>
          <View style={styles.orderCounts}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{ordersByStatus.NEW.length}</Text>
            </View>
            <Text style={styles.headerSubtitle}>Active Orders</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.headerButton} onPress={() => setSettingsModal(true)}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} horizontal={!isLargeTablet}>
        <View style={styles.columnsContainer}>
          {/* New Orders Column */}
          <View style={[styles.column, isLargeTablet && styles.columnLarge]}>
            <View style={[styles.columnHeader, { backgroundColor: '#dc3545' }]}>
              <Text style={styles.columnTitle}>NEW</Text>
              <Text style={styles.columnCount}>{ordersByStatus.NEW.length}</Text>
            </View>
            
            <ScrollView style={styles.columnContent}>
              {ordersByStatus.NEW.map((order) => (
                <View key={order.orderId} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={[styles.orderNumber, { fontSize: fontSizes.orderNumber }]}>
                      {getOrderNumber(order)}
                    </Text>
                    <View style={[styles.orderTypeBadge, { backgroundColor: '#dc3545' }]}>
                      <Ionicons name={getOrderTypeIcon(order.orderType) as any} size={16} color="#fff" />
                    </View>
                  </View>
                  
                  {order.customerPhone && (
                    <Text style={[styles.customerInfo, { fontSize: fontSizes.itemText }]}>
                      {order.customerPhone}
                    </Text>
                  )}
                  
                  <View style={styles.itemsList}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={[styles.itemQuantity, { fontSize: fontSizes.itemText }]}>
                          {item.quantity}x
                        </Text>
                        <Text style={[styles.itemName, { fontSize: fontSizes.itemText }]}>
                          {item.name}
                        </Text>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <Text style={[styles.itemModifiers, { fontSize: fontSizes.itemText - 2 }]}>
                            + {item.modifiers.map(m => m.name).join(', ')}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                  
                  <Text style={[styles.timeInKitchen, { fontSize: fontSizes.itemText }]}>
                    Time: {getTimeInKitchen(order)}
                  </Text>
                  
                  <View style={styles.actionButtons}>
                    <Pressable 
                      style={[styles.actionButton, styles.primaryButton]}
                      onPress={() => handleOrderAction(order, 'start')}
                    >
                      <Text style={[styles.buttonText, { fontSize: fontSizes.buttonText }]}>
                        Start Cooking
                      </Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.actionButton, styles.secondaryButton]}
                      onPress={() => handleOrderAction(order, 'cancel')}
                    >
                      <Text style={[styles.buttonText, { fontSize: fontSizes.buttonText, color: '#dc3545' }]}>
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Cooking Column */}
          <View style={[styles.column, isLargeTablet && styles.columnLarge]}>
            <View style={[styles.columnHeader, { backgroundColor: '#fd7e14' }]}>
              <Text style={styles.columnTitle}>COOKING</Text>
              <Text style={styles.columnCount}>{ordersByStatus.COOKING.length}</Text>
            </View>
            
            <ScrollView style={styles.columnContent}>
              {ordersByStatus.COOKING.map((order) => (
                <View key={order.orderId} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={[styles.orderNumber, { fontSize: fontSizes.orderNumber }]}>
                      {getOrderNumber(order)}
                    </Text>
                    <View style={[styles.orderTypeBadge, { backgroundColor: '#fd7e14' }]}>
                      <Ionicons name={getOrderTypeIcon(order.orderType) as any} size={16} color="#fff" />
                    </View>
                  </View>
                  
                  {order.customerPhone && (
                    <Text style={[styles.customerInfo, { fontSize: fontSizes.itemText }]}>
                      {order.customerPhone}
                    </Text>
                  )}
                  
                  <View style={styles.itemsList}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={[styles.itemQuantity, { fontSize: fontSizes.itemText }]}>
                          {item.quantity}x
                        </Text>
                        <Text style={[styles.itemName, { fontSize: fontSizes.itemText }]}>
                          {item.name}
                        </Text>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <Text style={[styles.itemModifiers, { fontSize: fontSizes.itemText - 2 }]}>
                            + {item.modifiers.map(m => m.name).join(', ')}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                  
                  <Text style={[styles.timeInKitchen, { fontSize: fontSizes.itemText }]}>
                    Time: {getTimeInKitchen(order)}
                  </Text>
                  
                  <View style={styles.actionButtons}>
                    <Pressable 
                      style={[styles.actionButton, styles.successButton]}
                      onPress={() => handleOrderAction(order, 'mark_ready')}
                    >
                      <Text style={[styles.buttonText, { fontSize: fontSizes.buttonText }]}>
                        Mark Ready
                      </Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.actionButton, styles.secondaryButton]}
                      onPress={() => handleOrderAction(order, 'cancel')}
                    >
                      <Text style={[styles.buttonText, { fontSize: fontSizes.buttonText, color: '#dc3545' }]}>
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ready Column */}
          <View style={[styles.column, isLargeTablet && styles.columnLarge]}>
            <View style={[styles.columnHeader, { backgroundColor: '#28a745' }]}>
              <Text style={styles.columnTitle}>READY</Text>
              <Text style={styles.columnCount}>{ordersByStatus.READY.length}</Text>
            </View>
            
            <ScrollView style={styles.columnContent}>
              {ordersByStatus.READY.map((order) => (
                <View key={order.orderId} style={[styles.orderCard, styles.readyCard]}>
                  <View style={styles.orderHeader}>
                    <Text style={[styles.orderNumber, { fontSize: fontSizes.orderNumber }]}>
                      {getOrderNumber(order)}
                    </Text>
                    <View style={[styles.orderTypeBadge, { backgroundColor: '#28a745' }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    </View>
                  </View>
                  
                  {order.customerPhone && (
                    <Text style={[styles.customerInfo, { fontSize: fontSizes.itemText }]}>
                      {order.customerPhone}
                    </Text>
                  )}
                  
                  <View style={styles.itemsList}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={[styles.itemQuantity, { fontSize: fontSizes.itemText }]}
                          {item.quantity}x
                        </Text>
                        <Text style={[styles.itemName, { fontSize: fontSizes.itemText }]}>
                          {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={[styles.timeInKitchen, { fontSize: fontSizes.itemText, color: '#28a745' }]}>
                    Ready: {getTimeInKitchen(order)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Delivered Column (Hidden on small screens) */}
          {isLargeTablet && (
            <View style={[styles.column, styles.columnArchive]}>
              <View style={[styles.columnHeader, { backgroundColor: '#6c757d' }]}>
                <Text style={styles.columnTitle}>DELIVERED</Text>
                <Pressable onPress={handleArchiveComplete}>
                  <Ionicons name="archive-outline" size={20} color="#fff" />
                </Pressable>
              </View>
              
              <ScrollView style={styles.columnContent}>
                {ordersByStatus.DELIVERED.map((order) => (
                  <View key={order.orderId} style={[styles.orderCard, styles.deliveredCard]}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderNumber, { fontSize: fontSizes.orderNumber - 6 }]}>
                        {getOrderNumber(order)}
                      </Text>
                    </View>
                    
                    <View style={styles.itemsList}>
                      {order.items.map((item, index) => (
                        <Text key={index} style={[styles.itemName, { fontSize: fontSizes.itemText - 2 }]}>
                          {item.quantity}x {item.name}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={settingsModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>KDS Settings</Text>
              <Pressable onPress={() => setSettingsModal(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Text Size</Text>
                <View style={styles.settingOptions}>
                  {['small', 'medium', 'large'].map((size) => (
                    <Pressable
                      key={size}
                      style={[
                        styles.settingOption,
                        textSize === size && styles.settingOptionActive
                      ]}
                      onPress={() => setTextSize(size)}
                    >
                      <Text style={textSize === size ? styles.settingOptionTextActive : styles.settingOptionText}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Volume</Text>
                <View style={styles.volumeControl}>
                  <Ionicons name="volume-low" size={20} color="#6c757d" />
                  <View style={styles.volumeSlider}>
                    <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
                  </View>
                  <Ionicons name="volume-high" size={20} color="#6c757d" />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20
  },
  headerLeft: {
    flex: 1
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#b0b0b0'
  },
  orderCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  countBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 8,
    marginLeft: 12
  },
  content: {
    flex: 1
  },
  columnsContainer: {
    flexDirection: 'row',
    minWidth: isLargeTablet ? 1200 : width * 3,
    height: '100%'
  },
  column: {
    flex: 1,
    minWidth: width * 0.85,
    borderRightWidth: 2,
    borderRightColor: '#2d2d2d'
  },
  columnLarge: {
    minWidth: 300
  },
  columnArchive: {
    minWidth: 200
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2d2d2d'
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff'
  },
  columnCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  columnContent: {
    flex: 1
  },
  orderCard: {
    backgroundColor: '#2d2d2d',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3d3d3d'
  },
  readyCard: {
    borderColor: '#28a745'
  },
  deliveredCard: {
    opacity: 0.6
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  orderNumber: {
    color: '#fff',
    fontWeight: '700'
  },
  orderTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  customerInfo: {
    color: '#b0b0b0',
    marginBottom: 12,
    fontWeight: '600'
  },
  itemsList: {
    marginBottom: 12
  },
  itemRow: {
    marginBottom: 8
  },
  itemQuantity: {
    color: '#fff',
    fontWeight: '700'
  },
  itemName: {
    color: '#fff',
    fontWeight: '600'
  },
  itemModifiers: {
    color: '#b0b0b0',
    fontStyle: 'italic',
    marginLeft: 24
  },
  timeInKitchen: {
    color: '#fd7e14',
    fontWeight: '600',
    marginBottom: 12
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: '#0d6efd'
  },
  successButton: {
    backgroundColor: '#28a745'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529'
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  settingItem: {
    marginBottom: 24
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 12
  },
  settingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    alignItems: 'center'
  },
  settingOptionActive: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd'
  },
  settingOptionText: {
    color: '#6c757d',
    fontWeight: '600'
  },
  settingOptionTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  volumeSlider: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 3
  }
});