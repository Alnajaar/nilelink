import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TextInput, Modal, Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId, items, total } = route.params;
  
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'pickup' ? 0 : 2.99;
  const tax = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + deliveryFee + tax;

  const handlePlaceOrder = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }

    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmModal(false);
    setOrderPlaced(true);
    
    // Simulate order processing
    setTimeout(() => {
      const mockOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      navigation.navigate('OrderTracking', { orderId: mockOrderId });
    }, 2000);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (orderPlaced) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#28a745" />
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successMessage}>Preparing your delicious meal</Text>
        <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#212529" />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}

          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          
          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>{formatCurrency(deliveryFee)}</Text>
          </View>
          
          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Tax (10%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          
          <View style={[styles.orderTotal, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          
          <Pressable
            style={[styles.optionButton, deliveryOption === 'delivery' && styles.optionButtonSelected]}
            onPress={() => setDeliveryOption('delivery')}
          >
            <Ionicons 
              name={deliveryOption === 'delivery' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={deliveryOption === 'delivery' ? '#0d6efd' : '#6c757d'}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Delivery</Text>
              <Text style={styles.optionSubtitle}>Deliver to your address</Text>
            </View>
            <Text style={styles.optionPrice}>{formatCurrency(2.99)}</Text>
          </Pressable>

          <Pressable
            style={[styles.optionButton, deliveryOption === 'pickup' && styles.optionButtonSelected]}
            onPress={() => setDeliveryOption('pickup')}
          >
            <Ionicons 
              name={deliveryOption === 'pickup' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={deliveryOption === 'pickup' ? '#0d6efd' : '#6c757d'}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Pickup</Text>
              <Text style={styles.optionSubtitle}>Pick up from restaurant</Text>
            </View>
            <Text style={styles.optionPrice}>Free</Text>
          </Pressable>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          
          {deliveryOption === 'delivery' && (
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Special Instructions (Optional)"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <Pressable
            style={[styles.optionButton, paymentMethod === 'card' && styles.optionButtonSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons 
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'card' ? '#0d6efd' : '#6c757d'}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Credit/Debit Card</Text>
              <Text style={styles.optionSubtitle}>Pay securely with your card</Text>
            </View>
            <Ionicons name="card-outline" size={24} color="#6c757d" />
          </Pressable>

          <Pressable
            style={[styles.optionButton, paymentMethod === 'cash' && styles.optionButtonSelected]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Ionicons 
              name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'cash' ? '#0d6efd' : '#6c757d'}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Cash on Delivery</Text>
              <Text style={styles.optionSubtitle}>Pay with cash when you receive your order</Text>
            </View>
            <Ionicons name="cash-outline" size={24} color="#6c757d" />
          </Pressable>
        </View>

        {/* Order Button */}
        <Pressable
          style={styles.orderButton}
          onPress={handlePlaceOrder}
        >
          <View style={styles.orderButtonContent}>
            <View>
              <Text style={styles.orderButtonText}>Place Order</Text>
              <Text style={styles.orderButtonMethod}>
                {paymentMethod === 'card' ? 'Pay with Card' : 'Cash on Delivery'}
              </Text>
            </View>
            <Text style={styles.orderButtonTotal}>{formatCurrency(totalAmount)}</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Order Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Order</Text>
              <Pressable onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close-circle" size={28} color="#6c757d" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Please confirm your order details before placing:
              </Text>
              
              <View style={styles.confirmationItem}>
                <Ionicons name="time-outline" size={20} color="#6c757d" />
                <Text style={styles.confirmationText}>
                  {deliveryOption === 'delivery' ? '25-35 min delivery' : '15-20 min for pickup'}
                </Text>
              </View>
              
              <View style={styles.confirmationItem}>
                <Ionicons name="location-outline" size={20} color="#6c757d" />
                <Text style={styles.confirmationText}>
                  {deliveryOption === 'delivery' ? deliveryAddress : 'Pickup from restaurant'}
                </Text>
              </View>
              
              <View style={styles.confirmationItem}>
                <Ionicons name="call-outline" size={20} color="#6c757d" />
                <Text style={styles.confirmationText}>{phoneNumber}</Text>
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.summaryItem}>
                    <Text style={styles.summaryItemText}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.summaryItemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
                <View style={styles.summaryTotal}>
                  <Text style={styles.summaryTotalText}>Total</Text>
                  <Text style={styles.summaryTotalPrice}>
                    {formatCurrency(totalAmount)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.confirmButtonText}>Confirm & Order</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#212529',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6efd',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  optionButtonSelected: {
    borderColor: '#0d6efd',
    backgroundColor: '#e7f5ff',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 12,
  },
  orderButton: {
    backgroundColor: '#0d6efd',
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
  },
  orderButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  orderButtonMethod: {
    color: '#e7f5ff',
    fontSize: 13,
    marginTop: 2,
  },
  orderButtonTotal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryItemText: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryItemPrice: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  summaryTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d6efd',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#0d6efd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#28a745',
    marginTop: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 8,
  },
});