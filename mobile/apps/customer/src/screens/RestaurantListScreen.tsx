import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Image,
  Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { customerActions, CustomerState, Restaurant } from '../store/customerSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');



import { api } from '@nilelink/mobile-shared';

export function RestaurantListScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const restaurants = useSelector<{ customer: CustomerState }, Restaurant[]>(state => state.customer.restaurants);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/restaurants');
        // Map backend response to UI model if fields are missing
        const mappedRestaurants: Restaurant[] = response.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisine || 'International', // Fallback
          rating: Number(r.rating) || 4.5,
          deliveryTime: r.deliveryTime || '30-45 min',
          deliveryFee: Number(r.deliveryFee) || 2.99,
          isOpen: r.isOpen ?? true,
          distance: r.distance || '2.5 km', // Mock distance for now if not calculated
          image: r.imageUrl
        }));
        dispatch(customerActions.setRestaurants(mappedRestaurants));
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [dispatch]);

  const cuisines = ['all', 'Egyptian', 'Mediterranean', 'Grill', 'Fast Food', 'Italian', 'Pizza', 'Indian', 'Asian'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' ||
      restaurant.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    if (!restaurant.isOpen) {
      return;
    }

    // Set current restaurant in Redux
    dispatch(customerActions.setRestaurant(restaurant));

    navigation.navigate('Menu' as never, {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name
    } as any);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurants</Text>
        <Pressable style={styles.locationButton}>
          <Ionicons name="location-outline" size={20} color="#0d6efd" />
          <Text style={styles.locationText}>Cairo, Egypt</Text>
          <Ionicons name="chevron-down-outline" size={16} color="#6c757d" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants or cuisines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Cuisine Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cuisineTabs}
        contentContainerStyle={styles.cuisineContent}
      >
        {cuisines.map((cuisine) => (
          <Pressable
            key={cuisine}
            style={[
              styles.cuisineTab,
              selectedCuisine === cuisine && styles.cuisineTabActive
            ]}
            onPress={() => setSelectedCuisine(cuisine)}
          >
            <Text style={[
              styles.cuisineText,
              selectedCuisine === cuisine && styles.cuisineTextActive
            ]}>
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Restaurant List */}
      <ScrollView style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
          </View>
        ) : filteredRestaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#adb5bd" />
            <Text style={styles.emptyStateText}>No restaurants found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={[
                styles.restaurantCard,
                !restaurant.isOpen && styles.restaurantCardClosed
              ]}
              onPress={() => handleRestaurantSelect(restaurant)}
            >
              {/* Restaurant Image */}
              <View style={styles.restaurantImagePlaceholder}>
                <Ionicons
                  name={restaurant.isOpen ? 'restaurant-outline' : 'close-circle-outline'}
                  size={48}
                  color={restaurant.isOpen ? '#0d6efd' : '#dc3545'}
                />
              </View>

              {/* Restaurant Info */}
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#fd7e14" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>

                <Text style={styles.cuisineText} numberOfLines={1}>
                  {restaurant.cuisine}
                </Text>

                <View style={styles.restaurantDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#6c757d" />
                    <Text style={styles.detailText}>{restaurant.deliveryTime}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color="#6c757d" />
                    <Text style={styles.detailText}>{restaurant.distance}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#6c757d" />
                    <Text style={styles.detailText}>{formatCurrency(restaurant.deliveryFee)}</Text>
                  </View>
                </View>

                {!restaurant.isOpen && (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedText}>Currently Closed</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#0d6efd',
    marginHorizontal: 4,
    fontWeight: '600',
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
  clearButton: {
    padding: 4,
  },
  cuisineTabs: {
    maxHeight: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cuisineContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cuisineTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  cuisineTabActive: {
    backgroundColor: '#0d6efd',
  },
  cuisineText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  cuisineTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
  },
  restaurantCardClosed: {
    opacity: 0.6,
  },
  restaurantImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  closedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});