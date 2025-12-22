import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Dimensions, Image
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { posActions } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

interface Restaurant {
  id: string;
  name: string;
  location: string;
  image?: string;
  status: 'active' | 'inactive';
  pendingOrders?: number;
  todayRevenue?: number;
}

const mockRestaurants: Restaurant[] = [
  {
    id: 'rest_001',
    name: 'Cairo Kitchen',
    location: '123 Nile Street, Downtown Cairo',
    status: 'active',
    pendingOrders: 3,
    todayRevenue: 485.50
  },
  {
    id: 'rest_002',
    name: 'Nile Grill',
    location: '45 Zamalek Bridge, Zamalek',
    status: 'active',
    pendingOrders: 1,
    todayRevenue: 245.75
  },
  {
    id: 'rest_003', 
    name: 'Pyramid Bistro',
    location: '789 Giza Plateau, Giza',
    status: 'active',
    pendingOrders: 0,
    todayRevenue: 892.25
  },
  {
    id: 'rest_004',
    name: 'Saffron Lounge',
    location: '22 Garden City, Cairo',
    status: 'inactive',
    pendingOrders: 0,
    todayRevenue: 0
  }
];

export function RestaurantSelectionScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant.id);
    dispatch(posActions.restaurantSelected(restaurant.id, restaurant.name));
    
    // Navigate to main app
    setTimeout(() => {
      navigation.navigate('MainTabs' as never);
    }, 300);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="business-outline" size={32} color="#0d6efd" />
            <Text style={styles.headerTitle}>Select Restaurant</Text>
            <Text style={styles.headerSubtitle}>Choose which location to manage</Text>
          </View>
        </View>

        {/* Restaurants Grid */}
        <View style={styles.restaurantsContainer}>
          <Text style={styles.sectionTitle}>Your Restaurants</Text>
          
          <View style={styles.restaurantsGrid}>
            {mockRestaurants.map((restaurant) => {
              const isSelected = selectedRestaurant === restaurant.id;
              const isInactive = restaurant.status === 'inactive';
              
              return (
                <Pressable
                  key={restaurant.id}
                  style={[
                    styles.restaurantCard,
                    isSelected && styles.restaurantCardSelected,
                    isInactive && styles.restaurantCardInactive
                  ]}
                  onPress={() => !isInactive && handleRestaurantSelect(restaurant)}
                  disabled={isInactive}
                >
                  {/* Restaurant Image Placeholder */}
                  <View style={styles.restaurantImage}>
                    {isInactive ? (
                      <Ionicons name="business-outline" size={48} color="#adb5bd" />
                    ) : (
                      <Ionicons name="restaurant-outline" size={48} color="#0d6efd" />
                    )}
                  </View>

                  {/* Restaurant Info */}
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantLocation} numberOfLines={1}>
                      {restaurant.location}
                    </Text>
                    
                    {isInactive ? (
                      <View style={styles.statusBadge}>
                        <Ionicons name="close-circle-outline" size={14} color="#dc3545" />
                        <Text style={styles.statusText}>Inactive</Text>
                      </View>
                    ) : (
                      <View style={styles.statsContainer}>
                        {restaurant.pendingOrders > 0 && (
                          <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={14} color="#fd7e14" />
                            <Text style={styles.statText}>{restaurant.pendingOrders} pending</Text>
                          </View>
                        )}
                        
                        {restaurant.todayRevenue > 0 && (
                          <View style={styles.statItem}>
                            <Ionicons name="cash-outline" size={14} color="#28a745" />
                            <Text style={styles.statText}>{formatCurrency(restaurant.todayRevenue)}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Selection Indicator */}
                  <View style={styles.selectionIndicator}>
                    <View style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Add New Restaurant */}
        <View style={styles.addSection}>
          <Pressable style={styles.addButton}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={24} color="#0d6efd" />
            </View>
            <Text style={styles.addButtonText}>Add New Restaurant</Text>
            <Text style={styles.addButtonSubtext}>Set up a new location</Text>
          </Pressable>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Pressable style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color="#6c757d" />
            <Text style={styles.helpText}>Need help? Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {selectedRestaurant && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Ionicons name="checkmark-circle" size={64} color="#28a745" />
            <Text style={styles.loadingTitle}>Restaurant Selected</Text>
            <Text style={styles.loadingSubtitle}>Loading your dashboard...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  content: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginTop: 12,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center'
  },
  restaurantsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16
  },
  restaurantsGrid: {
    flexDirection: isTablet ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 12
  },
  restaurantCard: {
    flex: 1,
    minWidth: isTablet ? '48%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  restaurantCardSelected: {
    borderColor: '#0d6efd',
    backgroundColor: '#e7f5ff'
  },
  restaurantCardInactive: {
    opacity: 0.5
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  restaurantInfo: {
    flex: 1
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc3545'
  },
  selectionIndicator: {
    marginLeft: 12
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioButtonSelected: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd'
  },
  addSection: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0d6efd',
    borderStyle: 'dashed',
    padding: 20
  },
  addIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6efd',
    marginBottom: 2
  },
  addButtonSubtext: {
    fontSize: 14,
    color: '#6c757d'
  },
  helpSection: {
    paddingHorizontal: 16,
    paddingBottom: 32
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContent: {
    alignItems: 'center'
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginTop: 16,
    marginBottom: 4
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6c757d'
  }
});