import React from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView,
  StatusBar, Image, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#050505', '#1a1a2e', '#050505']}
        style={styles.gradient}
      >
        {/* Background Glows */}
        <View style={[styles.glow, { top: -100, left: -50, backgroundColor: 'rgba(59, 130, 246, 0.15)' }]} />
        <View style={[styles.glow, { bottom: 100, right: -100, backgroundColor: 'rgba(139, 92, 246, 0.15)' }]} />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              style={styles.logoGradient}
            >
              <Ionicons name="flash" size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>NileLink</Text>
          <Text style={styles.heroSubtitle}>Decentralized Economic OS</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>SECURE • FAST • TRANSPARENT</Text>
          </View>
        </View>

        {/* Features Card (Glassmorphism) */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeader}>The Future of Local Commerce</Text>

          <View style={styles.featureItem}>
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.featureLabel}>Anchored Ledger</Text>
              <Text style={styles.featureSub}>Every transaction is on-chain verified</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconBox}>
              <Ionicons name="sync" size={20} color="#8b5cf6" />
            </View>
            <View>
              <Text style={styles.featureLabel}>Edge-First Sync</Text>
              <Text style={styles.featureSub}>Offline-capable, real-time updates</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <SafeAreaView style={styles.ctaSection}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('RestaurantList' as never)}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Browse Ecosystem</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Signup' as never)}
          >
            <Text style={styles.secondaryButtonText}>Create Partner Account</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 30 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.5 },
  heroSection: { flex: 1.2, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  logoContainer: { padding: 5, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
  logoGradient: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 5 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 0.5 },
  pillContainer: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWith: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  pillText: { fontSize: 10, fontWeight: '800', color: '#3b82f6', letterSpacing: 1.5 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 40
  },
  cardHeader: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  featureLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  featureSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  ctaSection: { marginBottom: 30 },
  primaryButton: { height: 60, borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  buttonGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secondaryButton: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  secondaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});