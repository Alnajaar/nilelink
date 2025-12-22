import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TextInput, Modal, Alert, Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { posActions } from '../store/posSlice';
import type { PosState, InventoryItem as InventoryItemType } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

interface RestockRequest {
  itemId: string;
  itemName: string;
  quantity: number;
  estimatedCost: number;
}

export function InventoryScreen() {
  const dispatch = useDispatch();
  const { inventory, restaurantId } = useSelector<{ pos: PosState }, PosState>(s => s.pos);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock categories - in real app, would come from menu items
  const categories = ['all', 'appetizers', 'main', 'desserts', 'beverages', 'sides'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || true; // Simplified for now
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.quantity < item.minQuantity);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(posActions.inventoryUpdated(itemId, quantity));
  };

  const handleRequestRestock = (item: InventoryItemType) => {
    setSelectedItem(item);
    setRestockQuantity(String(item.minQuantity * 2)); // Suggest double the min quantity
    setShowRestockModal(true);
  };

  const handleConfirmRestock = () => {
    if (!selectedItem || !restockQuantity) return;

    const quantity = parseInt(restockQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    // In real app, would calculate from item pricing
    const estimatedCost = quantity * 5; // Mock cost calculation

    const request: RestockRequest = {
      itemId: selectedItem.itemId,
      itemName: selectedItem.itemId, // Would use actual item name
      quantity,
      estimatedCost
    };

    // Notify supplier (mock)
    Alert.alert(
      'Restock Request Sent',
      `${request.itemName}: ${request.quantity} units requested\nEstimated cost: $${request.estimatedCost.toFixed(2)}`,
      [{ text: 'OK' }]
    );

    // Update last restocked time
    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity + quantity, // Add to inventory
      lastRestocked: new Date().toISOString()
    };
    
    handleUpdateQuantity(selectedItem.itemId, updatedItem.quantity);
    setShowRestockModal(false);
    setSelectedItem(null);
    setRestockQuantity('');
  };

  const getStockStatus = (item: InventoryItemType) => {
    if (item.quantity === 0) return { status: 'out', color: '#dc3545', label: 'Out of Stock' };
    if (item.quantity < item.minQuantity) return { status: 'low', color: '#fd7e14', label: 'Low Stock' };
    return { status: 'good', color: '#28a745', label: 'In Stock' };
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Recently';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const hasLowStock = lowStockItems.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <Pressable style={styles.headerButton}>
          <Ionicons name="filter-outline" size={24} color="#212529" />
        </Pressable>
      </View>

      {/* Low Stock Alert */}
      {hasLowStock && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={20} color="#856404" />
          <Text style={styles.alertText}>
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
          </Text>
          <Pressable
            onPress={() => setSearchQuery('')} // Clear search to show all
          >
            <Text style={styles.alertAction}>View All</Text>
          </Pressable>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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
              filterCategory === category && styles.categoryTabActive
            ]}
            onPress={() => setFilterCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              filterCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <ScrollView style={styles.listContainer}>
        {filteredInventory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#adb5bd" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No items match your search' : 'No inventory items found'}
            </Text>
          </View>
        ) : (
          filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <View key={item.itemId} style={styles.inventoryItem}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.itemId}</Text>
                    <View style={styles.stockStatus}>
                      <View style={[styles.statusIndicator, { backgroundColor: stockStatus.color }]} />
                      <Text style={styles.statusText}>{stockStatus.label}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.itemId, Math.max(0, item.quantity - 1))}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </Pressable>
                    
                    <Text style={styles.quantityDisplay}>{item.quantity}</Text>
                    
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reorder Point:</Text>
                    <Text style={styles.detailValue}>{item.minQuantity}</Text>
                  </View>
                  
                  {item.lastRestocked && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Restocked:</Text>
                      <Text style={styles.detailValue}>{formatLastUpdated(item.lastRestocked)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[styles.actionButton, styles.restockButton]}
                      onPress={() => handleRequestRestock(item)}
                      disabled={stockStatus.status === 'good'}
                    >
                      <Ionicons name="duplicate-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.actionButtonText}>
                        {stockStatus.status === 'good' ? 'Stock Good' : 'Request Restock'}
                      </Text>
                    </Pressable>
                    
                    <Pressable
                      style={[styles.actionButton, styles.toggleButton]}
                      onPress={() => handleUpdateQuantity(item.itemId, 0)}
                    >
                      <Ionicons name="power-outline" size={16} color="#dc3545" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Restock Modal */}
      <Modal
        visible={showRestockModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRestockModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Restock</Text>
              <Pressable onPress={() => setShowRestockModal(false)}>
                <Ionicons name="close-circle" size={28} color="#6c757d" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedItem && (
                <>
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemName}>{selectedItem.itemId}</Text>
                    <View style={styles.currentStock}>
                      <Text style={styles.currentStockLabel}>Current Stock:</Text>
                      <Text style={styles.currentStockValue}>{selectedItem.quantity}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Order Quantity</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={restockQuantity}
                      onChangeText={setRestockQuantity}
                      keyboardType="numeric"
                      placeholder="Enter quantity"
                      autoFocus
                    />
                    
                    <View style={styles.suggestions}>
                      {[selectedItem.minQuantity, selectedItem.minQuantity * 2, selectedItem.minQuantity * 3].map((suggestion) => (
                        <Pressable
                          key={suggestion}
                          style={styles.suggestionButton}
                          onPress={() => setRestockQuantity(String(suggestion))}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.costEstimate}>
                    <Text style={styles.costLabel}>Estimated Cost:</Text>
                    <Text style={styles.costValue}>
                      ${(parseInt(restockQuantity || '0', 10) * 5 || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.modalNotes}>
                    <Text style={styles.modalNote}>
                      This request will be sent to your supplier automatically.
                    </Text>
                    <Text style={styles.modalNote}>
                      Items will be added to inventory upon delivery confirmation.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRestockModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmRestock}
                disabled={!restockQuantity || parseInt(restockQuantity, 10) <= 0}
              >
                <Text style={styles.confirmButtonText}>Confirm Restock</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529'
  },
  headerButton: {
    padding: 4
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  alertText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#856404'
  },
  alertAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d6efd'
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    paddingVertical: 12
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
  listContainer: {
    flex: 1
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d'
  },
  inventoryItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityDisplay: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    minWidth: 40,
    textAlign: 'center'
  },
  itemDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8
  },
  restockButton: {
    backgroundColor: '#0d6efd'
  },
  toggleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    width: 44
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
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
  modalItemInfo: {
    marginBottom: 24
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8
  },
  currentStock: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currentStockLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8
  },
  currentStockValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529'
  },
  inputGroup: {
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8
  },
  modalInput: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da'
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  suggestionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 20
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d'
  },
  costEstimate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24
  },
  costLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  },
  costValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d6efd'
  },
  modalNotes: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  modalNote: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 4
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#e9ecef'
  },
  confirmButton: {
    backgroundColor: '#0d6efd'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d'
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});