import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Types
import { RootState, AppDispatch } from '../store';

// Import Actions
import {
  applyPromoCode,
  removePromoCode,
  updateDeliveryAddress,
  selectPaymentMethod,
  placeOrder,
  clearCart,
} from '../store/slices/checkoutSlice';

interface CartItem {
  id: string;
  menuItem: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
  quantity: number;
  customizations: { [key: string]: string[] };
  specialInstructions?: string;
  totalPrice: number;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  description: string;
  minimumOrder?: number;
  expiresAt?: string;
}

interface PaymentMethod {
  id: string;
  type: 'wallet' | 'card' | 'cash';
  name: string;
  lastFour?: string;
  balance?: number;
  isDefault: boolean;
}

const CheckoutScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.items);
  const checkout = useSelector((state: RootState) => state.checkout);
  const user = useSelector((state: RootState) => state.auth.user);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedTip, setSelectedTip] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Mock data for demonstration
  const mockCartItems: CartItem[] = [
    {
      id: '1',
      menuItem: {
        id: '1',
        name: 'Margherita Pizza (Large)',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100',
        category: 'Pizza',
      },
      quantity: 1,
      customizations: { crust: ['thick'], extra_toppings: ['pepperoni', 'mushrooms'] },
      specialInstructions: 'Extra cheese please',
      totalPrice: 22.99,
    },
    {
      id: '2',
      menuItem: {
        id: '2',
        name: 'Truffle Risotto',
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100',
        category: 'Pasta & Risotto',
      },
      quantity: 2,
      customizations: {},
      totalPrice: 49.98,
    },
  ];

  const mockRestaurant = {
    id: '1',
    name: 'Bella Italia',
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    estimatedDelivery: '25-35 min',
  };

  const mockPromoCodes: PromoCode[] = [
    {
      id: '1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      description: '20% off your first order',
      minimumOrder: 25,
    },
    {
      id: '2',
      code: 'FREESHIP',
      type: 'free_delivery',
      value: 0,
      description: 'Free delivery on orders over $30',
      minimumOrder: 30,
    },
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'wallet',
      name: 'NileLink Wallet',
      balance: 45.67,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      name: '•••• •••• •••• 4242',
      lastFour: '4242',
      isDefault: false,
    },
    {
      id: '3',
      type: 'cash',
      name: 'Cash on Delivery',
      isDefault: false,
    },
  ];

  const appliedPromoCode = checkout.appliedPromoCode;
  const deliveryAddress = checkout.deliveryAddress || {
    street: '123 Main Street',
    city: 'New York',
    zipCode: '10001',
  };
  const selectedPaymentMethod = checkout.selectedPaymentMethod || mockPaymentMethods[0];

  const calculateSubtotal = () => {
    return mockCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateDiscount = () => {
    if (!appliedPromoCode) return 0;

    const subtotal = calculateSubtotal();
    switch (appliedPromoCode.type) {
      case 'percentage':
        return (subtotal * appliedPromoCode.value) / 100;
      case 'fixed':
        return Math.min(appliedPromoCode.value, subtotal);
      case 'free_delivery':
        return mockRestaurant.deliveryFee;
      default:
        return 0;
    }
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.0875; // 8.75% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const deliveryFee = appliedPromoCode?.type === 'free_delivery' ? 0 : mockRestaurant.deliveryFee;
    const tip = selectedTip;

    return subtotal - discount + tax + deliveryFee + tip;
  };

  const handleApplyPromoCode = () => {
    if (!promoCodeInput.trim()) return;

    const promo = mockPromoCodes.find(p => p.code.toLowerCase() === promoCodeInput.toLowerCase());
    if (promo) {
      const subtotal = calculateSubtotal();
      if (promo.minimumOrder && subtotal < promo.minimumOrder) {
        Alert.alert('Promo Code', `This code requires a minimum order of $${promo.minimumOrder}`);
        return;
      }
      dispatch(applyPromoCode(promo));
      setPromoCodeInput('');
      Alert.alert('Success', 'Promo code applied successfully!');
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
    }
  };

  const handlePlaceOrder = async () => {
    const total = calculateTotal();
    const subtotal = calculateSubtotal();

    // Validate minimum order
    if (subtotal < mockRestaurant.minimumOrder) {
      Alert.alert('Minimum Order', `Minimum order is $${mockRestaurant.minimumOrder}`);
      return;
    }

    // Validate wallet balance if using wallet
    if (selectedPaymentMethod.type === 'wallet' && selectedPaymentMethod.balance! < total) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is not enough for this order.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      dispatch(placeOrder({
        items: mockCartItems,
        restaurant: mockRestaurant,
        deliveryAddress,
        paymentMethod: selectedPaymentMethod,
        promoCode: appliedPromoCode,
        tip: selectedTip,
        specialInstructions,
        total: calculateTotal(),
      }));

      dispatch(clearCart());
      Alert.alert('Order Placed!', 'Your order has been placed successfully. Track it in real-time!');
      // Navigate to order tracking screen
    } catch (error) {
      Alert.alert('Order Failed', 'There was an error placing your order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const tipOptions = [
    { label: 'No Tip', value: 0 },
    { label: '10%', value: calculateSubtotal() * 0.1 },
    { label: '15%', value: calculateSubtotal() * 0.15 },
    { label: '20%', value: calculateSubtotal() * 0.2 },
  ];

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={{
      flexDirection: 'row',
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
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Text style={{ fontSize: 24 }}>🍕</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 4,
        }}>
          {item.menuItem.name}
        </Text>

        {item.customizations && Object.keys(item.customizations).length > 0 && (
          <Text style={{
            fontSize: 12,
            color: '#6b7280',
            marginBottom: 4,
          }}>
            {Object.entries(item.customizations)
              .filter(([_, values]) => values.length > 0)
              .map(([key, values]) => `${key}: ${values.join(', ')}`)
              .join(' • ')}
          </Text>
        )}

        {item.specialInstructions && (
          <Text style={{
            fontSize: 12,
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            "{item.specialInstructions}"
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 4,
        }}>
          ${item.totalPrice.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          Qty: {item.quantity}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
        {/* Header */}
        <LinearGradient
          colors={['#0e372b', '#1a5240']}
          style={{
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8,
            }}
            onPress={() => {/* Navigate back */ }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}>
            Checkout
          </Text>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Restaurant Info */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1f2937',
              }}>
                {mockRestaurant.name}
              </Text>
              <View style={{
                backgroundColor: '#f0f9f4',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '500' }}>
                  {mockRestaurant.estimatedDelivery}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Your Order
            </Text>
            {mockCartItems.map(renderCartItem)}
          </View>

          {/* Special Instructions */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Special Instructions
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Any special requests for the kitchen..."
              multiline
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              maxLength={200}
            />
          </View>

          {/* Promo Code */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Promo Code
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  marginRight: 12,
                }}
                placeholder="Enter promo code"
                value={promoCodeInput}
                onChangeText={setPromoCodeInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#0e372b',
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  justifyContent: 'center',
                }}
                onPress={handleApplyPromoCode}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>

            {appliedPromoCode && (
              <View style={{
                backgroundColor: '#f0f9f4',
                borderRadius: 8,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#065f46' }}>
                    {appliedPromoCode.code}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#065f46' }}>
                    {appliedPromoCode.description}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dispatch(removePromoCode())}
                >
                  <Ionicons name="close" size={20} color="#065f46" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tip Selection */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Add a Tip
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {tipOptions.map((tip) => (
                <TouchableOpacity
                  key={tip.value}
                  style={{
                    flex: 1,
                    backgroundColor: selectedTip === tip.value ? '#0e372b' : '#f3f4f6',
                    borderRadius: 8,
                    padding: 12,
                    marginHorizontal: 4,
                    alignItems: 'center',
                  }}
                  onPress={() => setSelectedTip(tip.value)}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedTip === tip.value ? 'white' : '#374151',
                  }}>
                    {tip.label}
                  </Text>
                  {tip.value > 0 && (
                    <Text style={{
                      fontSize: 12,
                      color: selectedTip === tip.value ? 'rgba(255,255,255,0.8)' : '#6b7280',
                    }}>
                      ${tip.value.toFixed(2)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delivery Address */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Delivery Address
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}
              onPress={() => {/* Navigate to address selection */ }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  color: '#1f2937',
                  marginBottom: 4,
                }}>
                  {deliveryAddress.street}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  {deliveryAddress.city}, {deliveryAddress.zipCode}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 12,
            }}>
              Payment Method
            </Text>
            {mockPaymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: selectedPaymentMethod.id === method.id ? '#f0f9f4' : '#f9f9f9',
                  borderWidth: 1,
                  borderColor: selectedPaymentMethod.id === method.id ? '#10b981' : '#e5e7eb',
                }}
                onPress={() => dispatch(selectPaymentMethod(method))}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {method.type === 'wallet' && (
                    <MaterialCommunityIcons name="wallet" size={20} color="#0e372b" />
                  )}
                  {method.type === 'card' && (
                    <Ionicons name="card" size={20} color="#0e372b" />
                  )}
                  {method.type === 'cash' && (
                    <FontAwesome5 name="money-bill-wave" size={20} color="#0e372b" />
                  )}
                  <Text style={{ fontSize: 16, marginLeft: 12, color: '#1f2937' }}>
                    {method.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {method.balance && (
                    <Text style={{ fontSize: 14, color: '#6b7280', marginRight: 8 }}>
                      ${method.balance.toFixed(2)}
                    </Text>
                  )}
                  {selectedPaymentMethod.id === method.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Summary */}
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            marginBottom: 100,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 16,
            }}>
              Order Summary
            </Text>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>Subtotal</Text>
                <Text style={{ fontSize: 16, color: '#1f2937' }}>${calculateSubtotal().toFixed(2)}</Text>
              </View>

              {calculateDiscount() > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#10b981' }}>Discount</Text>
                  <Text style={{ fontSize: 16, color: '#10b981' }}>-${calculateDiscount().toFixed(2)}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>Tax</Text>
                <Text style={{ fontSize: 16, color: '#1f2937' }}>${calculateTax().toFixed(2)}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>Delivery Fee</Text>
                <Text style={{ fontSize: 16, color: '#1f2937' }}>
                  ${appliedPromoCode?.type === 'free_delivery' ? '0.00' : mockRestaurant.deliveryFee.toFixed(2)}
                </Text>
              </View>

              {selectedTip > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6b7280' }}>Tip</Text>
                  <Text style={{ fontSize: 16, color: '#1f2937' }}>${selectedTip.toFixed(2)}</Text>
                </View>
              )}
            </View>

            <View style={{
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingTop: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1f2937',
              }}>
                Total
              </Text>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#0e372b',
              }}>
                ${calculateTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: isPlacingOrder ? '#6b7280' : '#0e372b',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>
                  Placing Order...
                </Text>
                {/* Add loading spinner here */}
              </View>
            ) : (
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Place Order • ${calculateTotal().toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CheckoutScreen;