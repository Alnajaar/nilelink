import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    Modal,
    FlatList,
    Vibration,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Import Types
import { RootState, AppDispatch } from '../../store';

// Import Actions
import {
    processPayment,
    splitPayment,
    addTip,
    applyDiscount,
    generateReceipt,
    voidPayment,
} from '../../store/slices/paymentsSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'CASH' | 'CARD' | 'CRYPTO' | 'DIGITAL_WALLET';
    enabled: boolean;
    processingFee?: number;
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    tip: number;
    discount: number;
    finalTotal: number;
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

const PaymentProcessingScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const payments = useSelector((state: RootState) => state.payments);

    // Mock order data (in real app, this comes from Redux)
    const currentOrder: Order = {
        id: 'order_001',
        orderNumber: '#1001',
        customerName: 'John Smith',
        items: [
            { id: '1', name: 'Grilled Salmon', quantity: 1, price: 28.99, total: 28.99 },
            { id: '2', name: 'Caesar Salad', quantity: 1, price: 12.99, total: 12.99 },
            { id: '3', name: 'Sparkling Water', quantity: 2, price: 3.99, total: 7.98 },
        ],
        subtotal: 49.96,
        tax: 4.50,
        total: 54.46,
        tip: 0,
        discount: 0,
        finalTotal: 54.46,
    };

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [customTip, setCustomTip] = useState<string>('');
    const [splitPaymentModal, setSplitPaymentModal] = useState(false);
    const [splitAmounts, setSplitAmounts] = useState<{ [key: string]: string }>({});
    const [showReceipt, setShowReceipt] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState<Order | null>(null);

    // Payment methods available
    const paymentMethods: PaymentMethod[] = [
        {
            id: 'cash',
            name: 'Cash',
            icon: 'cash',
            color: '#10b981',
            type: 'CASH',
            enabled: true,
        },
        {
            id: 'card',
            name: 'Card',
            icon: 'credit-card',
            color: '#3b82f6',
            type: 'CARD',
            enabled: true,
            processingFee: 0.029, // 2.9%
        },
        {
            id: 'crypto',
            name: 'USDC',
            icon: 'bitcoin',
            color: '#8b5cf6',
            type: 'CRYPTO',
            enabled: true,
            processingFee: 0.005, // 0.5%
        },
        {
            id: 'apple_pay',
            name: 'Apple Pay',
            icon: 'mobile',
            color: '#000000',
            type: 'DIGITAL_WALLET',
            enabled: true,
            processingFee: 0.015, // 1.5%
        },
        {
            id: 'google_pay',
            name: 'Google Pay',
            icon: 'google',
            color: '#4285f4',
            type: 'DIGITAL_WALLET',
            enabled: true,
            processingFee: 0.015, // 1.5%
        },
    ];

    const tipOptions = [
        { label: 'No Tip', value: 0 },
        { label: '10%', value: 0.10 },
        { label: '15%', value: 0.15 },
        { label: '20%', value: 0.20 },
        { label: 'Custom', value: 'custom' },
    ];

    const handlePaymentMethodSelect = (methodId: string) => {
        setSelectedPaymentMethod(methodId);
        Vibration.vibrate(50); // Light haptic feedback
    };

    const handleTipSelect = (tipValue: number | 'custom') => {
        if (tipValue === 'custom') {
            // Custom tip will be handled by text input
            return;
        }

        const tipAmount = currentOrder.subtotal * tipValue;
        dispatch(addTip({ orderId: currentOrder.id, tipAmount }));
    };

    const handleCustomTipChange = (text: string) => {
        setCustomTip(text);
        const tipAmount = parseFloat(text) || 0;
        dispatch(addTip({ orderId: currentOrder.id, tipAmount }));
    };

    const handleSplitPayment = () => {
        setSplitPaymentModal(true);
    };

    const handleSplitConfirm = () => {
        const totalSplit = Object.values(splitAmounts).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);

        if (Math.abs(totalSplit - currentOrder.finalTotal) > 0.01) {
            Alert.alert('Error', 'Split amounts must equal the total amount');
            return;
        }

        // Process split payment
        const splitPayments = Object.entries(splitAmounts).map(([methodId, amount]) => ({
            methodId,
            amount: parseFloat(amount),
        }));

        dispatch(splitPayment({
            orderId: currentOrder.id,
            payments: splitPayments,
        }));

        setSplitPaymentModal(false);
        processFinalPayment();
    };

    const handleProcessPayment = async () => {
        if (!selectedPaymentMethod) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        if (splitPaymentModal) {
            handleSplitConfirm();
            return;
        }

        processFinalPayment();
    };

    const processFinalPayment = async () => {
        setProcessingPayment(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const paymentResult = await dispatch(processPayment({
                orderId: currentOrder.id,
                paymentMethod: selectedPaymentMethod!,
                amount: currentOrder.finalTotal,
            })).unwrap();

            setPaymentSuccess(currentOrder);
            setShowReceipt(true);

            // Auto-print receipt if configured
            // await printReceipt(currentOrder);

            // Reset form
            setSelectedPaymentMethod(null);
            setCustomTip('');

        } catch (error) {
            Alert.alert('Payment Failed', 'Please try again or contact support');
        } finally {
            setProcessingPayment(false);
        }
    };

    const printReceipt = async (order: Order) => {
        const receiptHtml = generateReceiptHtml(order);
        await Print.printAsync({ html: receiptHtml });
    };

    const shareReceipt = async (order: Order) => {
        const receiptHtml = generateReceiptHtml(order);
        const { uri } = await Print.printToFileAsync({ html: receiptHtml });
        await Sharing.shareAsync(uri);
    };

    const generateReceiptHtml = (order: Order) => {
        return `
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="center bold">NILELINK RESTAURANT</div>
          <div class="center">123 Main Street</div>
          <div class="center">New York, NY 10001</div>
          <div class="center">(555) 123-4567</div>
          <div class="line"></div>

          <div><strong>Order:</strong> ${order.orderNumber}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
          <div><strong>Customer:</strong> ${order.customerName}</div>
          <div class="line"></div>

          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between;">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${item.total.toFixed(2)}</span>
            </div>
          `).join('')}

          <div class="line"></div>

          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>

          ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Discount:</span>
              <span>-$${order.discount.toFixed(2)}</span>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between;">
            <span>Tax:</span>
            <span>$${order.tax.toFixed(2)}</span>
          </div>

          ${order.tip > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Tip:</span>
              <span>$${order.tip.toFixed(2)}</span>
            </div>
          ` : ''}

          <div class="line"></div>

          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>TOTAL:</span>
            <span>$${order.finalTotal.toFixed(2)}</span>
          </div>

          <div class="line"></div>

          <div class="center">Thank you for dining with us!</div>
          <div class="center">Visit us again soon</div>

          <div class="center" style="margin-top: 20px; font-size: 10px;">
            Powered by NileLink POS
          </div>
        </body>
      </html>
    `;
    };

    const renderSplitPaymentModal = () => (
        <Modal
            visible={splitPaymentModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSplitPaymentModal(false)}
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
                    maxHeight: screenHeight * 0.7,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                            Split Payment
                        </Text>
                        <TouchableOpacity onPress={() => setSplitPaymentModal(false)}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 16, marginBottom: 20 }}>
                        Total: ${currentOrder.finalTotal.toFixed(2)}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {paymentMethods.filter(m => m.enabled).map((method) => (
                            <View key={method.id} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 15,
                                padding: 15,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#e5e7eb',
                            }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: method.color,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 15,
                                }}>
                                    <Ionicons name={method.icon as any} size={20} color="white" />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600' }}>
                                        {method.name}
                                    </Text>
                                    {method.processingFee && (
                                        <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                            Fee: {(method.processingFee * 100).toFixed(1)}%
                                        </Text>
                                    )}
                                </View>

                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#d1d5db',
                                        borderRadius: 8,
                                        padding: 10,
                                        width: 80,
                                        textAlign: 'right',
                                        fontSize: 16,
                                    }}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={splitAmounts[method.id] || ''}
                                    onChangeText={(text) => setSplitAmounts(prev => ({
                                        ...prev,
                                        [method.id]: text
                                    }))}
                                />
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#0e372b',
                            borderRadius: 12,
                            paddingVertical: 16,
                            alignItems: 'center',
                            marginTop: 20,
                        }}
                        onPress={handleSplitConfirm}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            Confirm Split Payment
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderReceiptModal = () => (
        <Modal
            visible={showReceipt}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowReceipt(false)}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 20,
                    width: screenWidth * 0.9,
                    maxHeight: screenHeight * 0.8,
                }}>
                    <View style={{
                        alignItems: 'center',
                        marginBottom: 20,
                    }}>
                        <Ionicons name="checkmark-circle" size={60} color="#10b981" />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
                            Payment Successful!
                        </Text>
                    </View>

                    {paymentSuccess && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                                Order {paymentSuccess.orderNumber}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                                Total: ${paymentSuccess.finalTotal.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#f3f4f6',
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: 'center',
                                marginRight: 10,
                            }}
                            onPress={() => paymentSuccess && printReceipt(paymentSuccess)}
                        >
                            <Ionicons name="print" size={20} color="#374151" />
                            <Text style={{ fontSize: 12, color: '#374151', marginTop: 5 }}>
                                Print
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#f3f4f6',
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: 'center',
                                marginRight: 10,
                            }}
                            onPress={() => paymentSuccess && shareReceipt(paymentSuccess)}
                        >
                            <Ionicons name="share" size={20} color="#374151" />
                            <Text style={{ fontSize: 12, color: '#374151', marginTop: 5 }}>
                                Share
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#0e372b',
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                setShowReceipt(false);
                                setPaymentSuccess(null);
                                // Navigate back to order management
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#0e372b',
                paddingTop: 50,
                paddingBottom: 20,
                paddingHorizontal: 20,
            }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 10,
                }}>
                    💳 Payment
                </Text>
                <Text style={{
                    fontSize: 18,
                    color: 'white',
                    fontWeight: 'bold',
                }}>
                    {currentOrder.orderNumber} - {currentOrder.customerName}
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                {/* Order Summary */}
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 15,
                        color: '#1f2937',
                    }}>
                        Order Summary
                    </Text>

                    {currentOrder.items.map((item) => (
                        <View key={item.id} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f4f6',
                        }}>
                            <Text style={{ fontSize: 16, color: '#1f2937' }}>
                                {item.quantity}x {item.name}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '600' }}>
                                ${item.total.toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderTopWidth: 2,
                        borderTopColor: '#e5e7eb',
                        marginTop: 12,
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                            Total
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0e372b' }}>
                            ${currentOrder.finalTotal.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Tip Selection */}
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 15,
                        color: '#1f2937',
                    }}>
                        Add Tip
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginBottom: 15,
                    }}>
                        {tipOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value.toString()}
                                style={{
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    marginRight: 10,
                                    marginBottom: 10,
                                    borderWidth: 2,
                                    borderColor: 'transparent',
                                }}
                                onPress={() => handleTipSelect(option.value)}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                                    {option.label}
                                </Text>
                                {typeof option.value === 'number' && (
                                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                        ${(currentOrder.subtotal * option.value).toFixed(2)}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 16, color: '#374151', marginRight: 10 }}>
                            Custom Tip:
                        </Text>
                        <TextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 8,
                                padding: 10,
                                fontSize: 16,
                            }}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={customTip}
                            onChangeText={handleCustomTipChange}
                        />
                    </View>

                    {currentOrder.tip > 0 && (
                        <Text style={{
                            fontSize: 16,
                            color: '#10b981',
                            fontWeight: '600',
                            marginTop: 10,
                        }}>
                            Tip Added: ${currentOrder.tip.toFixed(2)}
                        </Text>
                    )}
                </View>

                {/* Payment Methods */}
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 15,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#1f2937',
                        }}>
                            Payment Method
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#0e372b',
                                borderRadius: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                            }}
                            onPress={handleSplitPayment}
                        >
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                                Split Payment
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {paymentMethods.filter(m => m.enabled).map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                marginBottom: 8,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: selectedPaymentMethod === method.id ? method.color : '#e5e7eb',
                                backgroundColor: selectedPaymentMethod === method.id ? `${method.color}10` : 'white',
                            }}
                            onPress={() => handlePaymentMethodSelect(method.id)}
                        >
                            <View style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                backgroundColor: method.color,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16,
                            }}>
                                <Ionicons name={method.icon as any} size={24} color="white" />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: selectedPaymentMethod === method.id ? method.color : '#1f2937',
                                }}>
                                    {method.name}
                                </Text>
                                {method.processingFee && (
                                    <Text style={{
                                        fontSize: 14,
                                        color: selectedPaymentMethod === method.id ? method.color : '#6b7280',
                                    }}>
                                        Processing Fee: {(method.processingFee * 100).toFixed(1)}%
                                    </Text>
                                )}
                            </View>

                            {selectedPaymentMethod === method.id && (
                                <Ionicons name="checkmark-circle" size={24} color={method.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Payment Button */}
            <View style={{
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                padding: 20,
            }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: processingPayment ? '#6b7280' : selectedPaymentMethod ? '#0e372b' : '#d1d5db',
                        borderRadius: 12,
                        paddingVertical: 18,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    onPress={handleProcessPayment}
                    disabled={processingPayment || !selectedPaymentMethod}
                >
                    {processingPayment ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="loading" size={20} color="white" />
                            <Text style={{
                                color: 'white',
                                fontSize: 18,
                                fontWeight: 'bold',
                                marginLeft: 10,
                            }}>
                                Processing Payment...
                            </Text>
                        </View>
                    ) : (
                        <Text style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}>
                            Pay ${currentOrder.finalTotal.toFixed(2)}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals */}
            {renderSplitPaymentModal()}
            {renderReceiptModal()}
        </View>
    );
};

export default PaymentProcessingScreen;