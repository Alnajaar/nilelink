import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TextInput, Image, Dimensions, Modal, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { customerActions, CustomerState, CartItem } from '../store/customerSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '@nilelink/mobile-shared';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  popular?: boolean;
  rating?: number;
  preparationTime?: string;
}

export function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { restaurantId, restaurantName } = route.params as { restaurantId: string; restaurantName: string };
  const cart = useSelector<{ customer: CustomerState }, { restaurantId: string | null; items: CartItem[] }>(state => state.customer.cart);
  const currentCartItems = cart.restaurantId === restaurantId ? cart.items : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/restaurants/${restaurantId}`);
      if (response.data.success && response.data.data.restaurant.menuItems) {
        const items = response.data.data.restaurant.menuItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: Number(item.price),
          category: item.category,
          popular: item.popular || false,
          preparationTime: `${item.preparationTime || 20} min`
        }));
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = currentCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = currentCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: MenuItem) => {
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    };

    dispatch(customerActions.addToCart({ restaurantId, item: cartItem }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    dispatch(customerActions.removeFromCart(itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(customerActions.updateCartQuantity({ itemId, quantity }));
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout' as never, { restaurantId, restaurantName } as any);
  };

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={{ marginTop: 12, color: '#6c757d' }}>Loading Nile-Edge Menu...</Text>
        </View>
      </SafeAreaView>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.restaurantStatus}>Open • 25-35 min</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Profile' as never)} style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={28} color="#212529" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable onPress={() => setShowFilters(true)} style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#6c757d" />
          </Pressable>
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
              selectedCategory === category && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(category)}
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

      {/* Popular Items Section */}
      {selectedCategory === 'All' && searchQuery === '' && menuItems.some(i => i.popular) && (
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.popularItems}
            contentContainerStyle={styles.popularContent}
          >
            {menuItems.filter(item => item.popular).map((item) => (
              <Pressable
                key={item.id}
                style={styles.popularItemCard}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.popularItemImage}>
                  <Ionicons name="fast-food-outline" size={32} color="#0d6efd" />
                </View>
                <Text style={styles.popularItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.popularItemPrice}>{formatCurrency(item.price)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Menu Items */}
      <ScrollView style={styles.menuList}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'All Items' : selectedCategory}
        </Text>

        {filteredItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="restaurant-outline" size={32} color="#0d6efd" />
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </View>

              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                {item.preparationTime && (
                  <Text style={styles.prepTime}>{item.preparationTime}</Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Cart Floating Button */}
      {cartCount > 0 && (
        <Pressable style={styles.cartButton} onPress={handleCheckout}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartCount}>{cartCount}</Text>
          </View>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <View style={styles.cartInfo}>
            <Text style={styles.cartButtonText}>View Cart</Text>
            <Text style={styles.cartButtonTotal}>{formatCurrency(cartTotal)}</Text>
          </View>
        </Pressable>
      )}

      {/* Item Detail Modal */}
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
                <Ionicons name="restaurant-outline" size={64} color="#0d6efd" />
              </View>

              <Text style={styles.modalDescription}>
                {selectedItem?.description}
              </Text>

              <View style={styles.modalPriceContainer}>
                <Text style={styles.modalPriceLabel}>Price:</Text>
                <Text style={styles.modalPrice}>
                  {formatCurrency(selectedItem?.price || 0)}
                </Text>
              </View>

              {selectedItem?.preparationTime && (
                <View style={styles.modalPrepTime}>
                  <Ionicons name="time-outline" size={16} color="#6c757d" />
                  <Text style={styles.modalPrepTimeText}>
                    {selectedItem.preparationTime}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.addToCartButton}
                onPress={() => {
                  if (selectedItem) {
                    handleAddToCart(selectedItem);
                    setShowItemModal(false);
                  }
                }}
              >
                <Text style={styles.addToCartButtonText}>
                  Add to Cart - {formatCurrency(selectedItem?.price || 0)}
                </Text>
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  restaurantStatus: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    paddingVertical: 12,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryTabs: {
    maxHeight: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  categoryTabActive: {
    backgroundColor: '#0d6efd',
  },
  categoryText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  popularSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  popularItems: {
    maxHeight: 180,
  },
  popularContent: {
    paddingHorizontal: 16,
  },
  popularItemCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
    alignItems: 'center',
  },
  popularItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  popularItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d6efd',
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#856404',
  },
  itemDescription: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d6efd',
  },
  prepTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cartInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartButtonTotal: {
    color: '#fff',
    fontSize: 18,
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
    flex: 1,
    marginRight: 12,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalItemImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPriceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginRight: 8,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0d6efd',
  },
  modalPrepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalPrepTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addToCartButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});