import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  StatusBar, Image, Dimensions, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0d6efd', '#0056b3']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/food-delivery.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>NileLink</Text>
          <Text style={styles.heroSubtitle}>Food Delivery & Pickup</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <Ionicons name="rocket-outline" size={32} color="#fff" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Lightning Fast</Text>
              <Text style={styles.featureDesc}>Quick delivery from your favorite restaurants</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="lock-closed-outline" size={32} color="#fff" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure Payments</Text>
              <Text style={styles.featureDesc}>Pay with crypto or cash safely</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="restaurant-outline" size={32} color="#fff" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Best Restaurants</Text>
              <Text style={styles.featureDesc}>Curated selection of top local food</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Signup' as never)}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('RestaurantList' as never)}
          >
            <Text style={styles.secondaryButtonText}>Browse Restaurants</Text>
          </Pressable>

          <Text style={styles.loginPrompt}>
            Already have an account? <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroImage: {
    width: width * 0.6,
    height: height * 0.2,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#e7f5ff',
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#e7f5ff',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPrompt: {
    color: '#e7f5ff',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});