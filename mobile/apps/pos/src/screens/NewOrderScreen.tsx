import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Modal,
  TextInput, SafeAreaView, StatusBar, Dimensions, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { posActions } from '../store/posSlice';
import type { PosState, MenuItem } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

type Modifier = {
  id: string;
  name: string;
  price_usd?: number;
  selected?: boolean;
};

export function NewOrderScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const state = useSelector<{ pos: PosState }, PosState>(s => s.pos);
  
  const { currentOrder, menuItems, selectedCategory, searchQuery } = state;
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemModifiers, setItemModifiers] = useState<Modifier[]>([]);

  // Mock menu categories - in real app, would come from database
  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides'];

  const filteredMenuItems = useMemo(() => {
    let items = menuItems;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.name_ar && item.name_ar.toLowerCase().includes(query))
      );
    }
    
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const subtotal = currentOrder.items.reduce((sum, item) => 
    sum + (item.price_usd * item.quantity), 0
  );

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    // Mock modifiers - in real app, would come from item data
    setItemModifiers([
      { id: '1', name: 'Extra Cheese', price_usd: 1.00, selected: false },
      { id: '2', name: 'Spicy', price_usd: 0.50, selected: false },
      { id: '3', name: 'Gluten Free', price_usd: 2.00, selected: false },
    ]);
    setShowItemModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    dispatch(posActions.orderItemAdded({
      ...selectedItem,
      modifiers: itemModifiers.filter(m => m.selected)
    }));
    
    setShowItemModal(false);
    setSelectedItem(null);
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(posActions.orderItemRemoved(itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(posActions.orderItemQuantityUpdated(itemId, quantity));
  };

  const handleCustomerPhoneChange = (phone: string) => {
    dispatch(posActions.orderCustomerUpdated(phone));
  };

  const handleOrderTypeChange = (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') => {
    dispatch(posActions.orderTypeUpdated(type));
  };

  const handleNotesChange = (notes: string) => {
    dispatch(posActions.orderNotesUpdated(notes));
  };

  const handleSubmitOrder = () => {
    if (currentOrder.items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    const orderData = {
      restaurantId: state.restaurantId || 'demo-restaurant',
      customerPhone: currentOrder.customerPhone,
      items: currentOrder.items,
      subtotal_usd: subtotal,
      total_usd: total,
      orderType: currentOrder.orderType,
      paymentMethod: 'BLOCKCHAIN' as const,
      status: state.isConnected ? 'PAID' : 'CREATED',
      notes: currentOrder.notes
    };

    dispatch(posActions.orderCreated(orderData));
    navigation.navigate('Dashboard' as never);
  };

  const toggleModifier = (modifierId: string) => {
    setItemModifiers(prev => 
      prev.map(m => m.id === modifierId ? { ...m, selected: !m.selected } : m)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#212529" />
        </Pressable>
        <Text style={styles.headerTitle}>New Order</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Menu Section */}
        <View style={[styles.menuSection, !isTablet && { flex: 1 }]}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6c757d" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items (Arabic or English)"
              value={searchQuery}
              onChangeText={(text) => dispatch(posActions.menuSearchQueryUpdated(text))}
            />
            {/* Clear search button */}
            {searchQuery ? (
              <Pressable 
                onPress={() => dispatch(posActions.menuSearchQueryUpdated(''))}
                style={styles.clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#6c757d" />
              </Pressable>
            ) : null}
          </View>

          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.categoryTabActive
                ]}
                onPress={() => dispatch(posActions.menuCategorySelected(category))}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Menu Items Grid */}
          <ScrollView style={styles.menuGrid}>
            <View style={styles.menuItemsContainer}>
              {filteredMenuItems.map((item) => (
                <Pressable
                  key={item.itemId}
                  style={styles.menuItemCard}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#adb5bd" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.name_ar && (
                      <Text style={styles.itemNameAr} numberOfLines={1}>
                        {item.name_ar}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>${item.price_usd.toFixed(2)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Cart Sidebar */}
        <View style={[styles.cartSection, isTablet && styles.cartSectionTablet]}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Order Cart</Text>
            <Text style={styles.cartCount}>
              {currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </Text>
          </View>

          <ScrollView style={styles.cartItems}>
            {currentOrder.items.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={48} color="#adb5bd" />
                <Text style={styles.emptyCartText}>No items added</Text>
              </View>
            ) : (
              currentOrder.items.map((item) => (
                <View key={item.itemId} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>${item.price_usd.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </Pressable>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </Pressable>
                  </View>
                  
                  <Pressable
                    onPress={() => handleRemoveItem(item.itemId)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.orderDetails}>
            {/* Order Type Toggle */}
            <View style={styles.orderTypeContainer}>
              <Text style={styles.sectionLabel}>Order Type</Text>
              <View style={styles.orderTypeButtons}>
                {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.orderTypeButton,
                      currentOrder.orderType === type && styles.orderTypeButtonActive
                    ]}
                    onPress={() => handleOrderTypeChange(type)}
                  >
                    <Text style={[
                      styles.orderTypeText,
                      currentOrder.orderType === type && styles.orderTypeTextActive
                    ]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Customer Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>Customer Phone (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#6c757d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+20 123 456 7890"
                  value={currentOrder.customerPhone}
                  onChangeText={handleCustomerPhoneChange}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Special requests, allergies, etc."
                value={currentOrder.notes}
                onChangeText={handleNotesChange}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (10%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.submitButton, currentOrder.items.length === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmitOrder}
              disabled={currentOrder.items.length === 0}
            >
              <Text style={styles.submitButtonText}>Submit Order</Text>
              <Text style={styles.submitButtonAmount}>${total.toFixed(2)}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Item Details Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowItemModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              <Pressable onPress={() => setShowItemModal(false)}>
                <Ionicons name="close-circle" size={28} color="#6c757d" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalItemImage}>
                <Ionicons name="image-outline" size={64} color="#adb5bd" />
              </View>

              <Text style={styles.itemDescription}>
                {selectedItem?.description || 'No description available'}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price: </Text>
                <Text style={styles.priceValue}>${selectedItem?.price_usd.toFixed(2)}</Text>
              </View>

              {/* Modifiers */}
              {itemModifiers.length > 0 && (
                <View style={styles.modifiersSection}>
                  <Text style={styles.modifiersTitle}>Modifiers</Text>
                  {itemModifiers.map((modifier) => (
                    <Pressable
                      key={modifier.id}
                      style={[
                        styles.modifierItem,
                        modifier.selected && styles.modifierItemSelected
                      ]}
                      onPress={() => toggleModifier(modifier.id)}
                    >
                      <Ionicons
                        name={modifier.selected ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color={modifier.selected ? '#0d6efd' : '#6c757d'}
                      />
                      <View style={styles.modifierInfo}>
                        <Text style={styles.modifierName}>{modifier.name}</Text>
                        {modifier.price_usd && (
                          <Text style={styles.modifierPrice}>+${modifier.price_usd.toFixed(2)}</Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Quantity Selector */}
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantitySelector}>
                  <Pressable
                    onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    style={styles.quantityButtonLarge}
                  >
                    <Ionicons name="remove" size={24} color="#fff" />
                  </Pressable>
                  
                  <Text style={styles.quantityDisplay}>{itemQuantity}</Text>
                  
                  <Pressable
                    onPress={() => setItemQuantity(itemQuantity + 1)}
                    style={styles.quantityButtonLarge}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.addButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
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
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center'
  },
  headerRight: {
    width: 24
  },
  content: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column'
  },
  menuSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRightWidth: isTablet ? 1 : 0,
    borderRightColor: isTablet ? '#e9ecef' : 'transparent'
  },
  cartSection: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: !isTablet ? 1 : 0,
    borderTopColor: !isTablet ? '#e9ecef' : 'transparent'
  },
  cartSectionTablet: {
    width: 400
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529'
  },
  clearSearch: {
    padding: 4
  },
  categoryTabs: {
    maxHeight: 56
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef'
  },
  categoryTabActive: {
    backgroundColor: '#0d6efd'
  },
  categoryText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600'
  },
  categoryTextActive: {
    color: '#fff'
  },
  menuGrid: {
    flex: 1
  },
  menuItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12
  },
  menuItemCard: {
    width: isTablet ? '48%' : '100%',
    margin: '1%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12
  },
  itemImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2
  },
  itemNameAr: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d6efd'
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff'
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529'
  },
  cartCount: {
    fontSize: 14,
    color: '#6c757d'
  },
  cartItems: {
    maxHeight: isTablet ? height * 0.3 : height * 0.25
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyCartText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d'
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff'
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 8
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  },
  removeButton: {
    padding: 4,
    marginLeft: 8
  },
  orderDetails: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  orderTypeContainer: {
    marginBottom: 16
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: 8
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    alignItems: 'center'
  },
  orderTypeButtonActive: {
    backgroundColor: '#0d6efd'
  },
  orderTypeText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600'
  },
  orderTypeTextActive: {
    color: '#fff'
  },
  inputGroup: {
    marginBottom: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da'
  },
  inputIcon: {
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#212529'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  orderSummary: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529'
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6efd'
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#0d6efd'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  submitButtonAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d'
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
    maxHeight: height * 0.8
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
    color: '#212529',
    flex: 1,
    marginRight: 12
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  modalItemImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  itemDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  priceLabel: {
    fontSize: 16,
    color: '#6c757d'
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0d6efd'
  },
  modifiersSection: {
    marginBottom: 24
  },
  modifiersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12
  },
  modifierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  modifierItemSelected: {
    backgroundColor: '#e7f5ff'
  },
  modifierInfo: {
    flex: 1,
    marginLeft: 12
  },
  modifierName: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600'
  },
  modifierPrice: {
    fontSize: 13,
    color: '#28a745',
    marginTop: 2
  },
  quantitySection: {
    marginBottom: 24
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityButtonLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityDisplay: {
    marginHorizontal: 24,
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    minWidth: 60,
    textAlign: 'center'
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0d6efd',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  }
});