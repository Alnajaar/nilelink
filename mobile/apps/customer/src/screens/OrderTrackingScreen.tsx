import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Dimensions, ActivityIndicator, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'delivered';

interface OrderTracker {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
}

export function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('confirmed');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [animation] = useState(new Animated.Value(0));

  const orderSteps: OrderTracker[] = [
    {
      status: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed',
      timestamp: '12:30 PM',
      completed: currentStatus !== 'confirmed',
      active: currentStatus === 'confirmed'
    },
    {
      status: 'preparing',
      title: 'Preparing',
      description: 'Kitchen is preparing your food',
      timestamp: '12:35 PM',
      completed: ['ready', 'delivered'].includes(currentStatus),
      active: currentStatus === 'preparing'
    },
    {
      status: 'ready',
      title: 'Ready',
      description: 'Your order is ready!',
      timestamp: '12:55 PM',
      completed: currentStatus === 'delivered',
      active: currentStatus === 'ready'
    },
    {
      status: 'delivered',
      title: 'Delivered',
      description: 'Order delivered successfully',
      timestamp: '1:15 PM',
      completed: currentStatus === 'delivered',
      active: currentStatus === 'delivered'
    }
  ];

  useEffect(() => {
    // Simulate order status updates
    const intervals = [
      setTimeout(() => setCurrentStatus('preparing'), 3000),
      setTimeout(() => setCurrentStatus('ready'), 6000),
      setTimeout(() => setCurrentStatus('delivered'), 9000),
      setTimeout(() => setShowRating(true), 10000),
    ];

    return () => intervals.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return '#0d6efd';
      case 'preparing': return '#fd7e14';
      case 'ready': return '#28a745';
      case 'delivered': return '#20c997';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'preparing': return 'time';
      case 'ready': return 'star';
      case 'delivered': return 'home';
    }
  };

  const handleRatingSubmit = () => {
    navigation.navigate('RestaurantList' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#212529" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.orderNumber}>{orderId}</Text>
        </View>
        <Pressable onPress={() => {}} style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#0d6efd" />
        </Pressable>
      </View>

      {/* Delivery Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(currentStatus) + '20' }]}>
            <Ionicons name={getStatusIcon(currentStatus)} size={32} color={getStatusColor(currentStatus)} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.currentStatus}>{orderSteps.find(s => s.status === currentStatus)?.title}</Text>
            <Text style={styles.currentDescription}>
              {orderSteps.find(s => s.status === currentStatus)?.description}
            </Text>
          </View>
        </View>
        
        {currentStatus !== 'delivered' && (
          <View style={styles.deliveryProgress}>
            <ActivityIndicator size="small" color="#0d6efd" />
            <Text style={styles.deliveryText}>
              {currentStatus === 'confirmed' && 'Preparing your order...'}
              {currentStatus === 'preparing' && 'Almost ready...'}
              {currentStatus === 'ready' && 'Headed your way!'}
            </Text>
          </View>
        )}
      </View>

      {/* Order Timeline */}
      <ScrollView style={styles.timeline}>
        <Text style={styles.timelineTitle}>Order Timeline</Text>
        
        {orderSteps.map((step, index) => (
          <View key={step.status} style={styles.timelineStep}>
            <View style={styles.stepLineContainer}>
              {index !== orderSteps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  step.completed && { backgroundColor: '#28a745' }
                ]} />
              )}
            </View>
            
            <View style={styles.stepIconContainer}>
              <View style={[
                styles.stepIcon,
                step.completed && { backgroundColor: '#28a745' },
                step.active && { backgroundColor: getStatusColor(currentStatus) }
              ]}>
                <Ionicons 
                  name={getStatusIcon(step.status)} 
                  size={20} 
                  color="#fff" 
                />
              </View>
            </View>
            
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                (step.completed || step.active) && styles.stepTitleActive
              ]}>
                {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
              {step.timestamp && (
                <Text style={styles.stepTimestamp}>{step.timestamp}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Order Details</Text>
        
        <View style={styles.detailsRow}>
          <Ionicons name="restaurant-outline" size={20} color="#6c757d" />
          <View style={styles.detailsText}>
            <Text style={styles.detailsLabel}>Cairo Kitchen</Text>
            <Text style={styles.detailsValue}>2 items • $24.50</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="location-outline" size={20} color="#6c757d" />
          <View style={styles.detailsText}>
            <Text style={styles.detailsLabel}>Delivering to:</Text>
            <Text style={styles.detailsValue}>123 Nile Street, Downtown Cairo</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="person-circle-outline" size={20} color="#6c757d" />
          <View style={styles.detailsText}>
            <Text style={styles.detailsLabel}>Rider: Ahmed M.</Text>
            <Text style={styles.detailsValue}>+20 123 456 7890</Text>
          </View>
        </View>
      </View>

      {/* Rating Modal */}
      {showRating && (
        <View style={styles.ratingOverlay}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>How was your order?</Text>
            <Text style={styles.ratingSubtitle}>Rate your experience with Cairo Kitchen</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#fd7e14' : '#e9ecef'}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.ratingFeedback}>
              {rating === 0 && 'Please select a rating'}
              {rating === 1 && 'Poor experience'}
              {rating === 2 && 'Below average'}
              {rating === 3 && 'Average experience'}
              {rating === 4 && 'Good experience'}
              {rating === 5 && 'Excellent experience!'}
            </Text>

            <Pressable
              style={[styles.rateButton, rating === 0 && styles.rateButtonDisabled]}
              onPress={handleRatingSubmit}
              disabled={rating === 0}
            >
              <Text style={styles.rateButtonText}>
                Submit Rating
              </Text>
            </Pressable>
          </View>
        </View>
      )}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  orderNumber: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  helpButton: {
    padding: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  currentStatus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  currentDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  deliveryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#e7f5ff',
    borderRadius: 12,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0d6efd',
  },
  timeline: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepLineContainer: {
    width: 2,
    marginRight: 16,
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e9ecef',
  },
  stepIconContainer: {
    marginRight: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  stepTitleActive: {
    color: '#212529',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 4,
  },
  stepTimestamp: {
    fontSize: 12,
    color: '#adb5bd',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsText: {
    flex: 1,
    marginLeft: 12,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 13,
    color: '#6c757d',
  },
  ratingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  ratingFeedback: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 24,
    minHeight: 24,
  },
  rateButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  rateButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});