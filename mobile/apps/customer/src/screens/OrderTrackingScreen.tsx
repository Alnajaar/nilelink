import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Dimensions, ActivityIndicator, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { CustomerState, customerActions } from '../store/customerSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'delivered';

export function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const dispatch = useDispatch();

  const activeOrders = useSelector<{ customer: CustomerState }, any[]>(state => state.customer.activeOrders);
  const currentOrder = activeOrders.find(o => o.id === orderId);
  const currentStatus = (currentOrder?.status || 'confirmed') as OrderStatus;

  const steps: { key: OrderStatus, label: string, icon: string }[] = [
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'preparing', label: 'Preparing', icon: 'restaurant' },
    { key: 'ready', label: 'Ready', icon: 'bag-check' },
    { key: 'delivered', label: 'Arrived', icon: 'home' }
  ];

  useEffect(() => {
    if (currentStatus !== 'delivered') {
      const timer = setTimeout(() => {
        const nextMap: Record<OrderStatus, OrderStatus> = {
          'confirmed': 'preparing',
          'preparing': 'ready',
          'ready': 'delivered',
          'delivered': 'delivered'
        };
        dispatch(customerActions.updateOrderStatus({ orderId, status: nextMap[currentStatus] }));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#050505', '#111']} style={styles.fullGradient}>

        {/* Profile/Order Header */}
        <SafeAreaView>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View>
              <Text style={styles.orderIdText}>ORDER #{orderId?.split('-')[1]?.toUpperCase() || 'TX-492'}</Text>
              <Text style={styles.headerStatusText}>Real-time synchronization active</Text>
            </View>
            <View style={styles.edgeBadge}>
              <View style={styles.dot} />
              <Text style={styles.edgeText}>NILE-EDGE</Text>
            </View>
          </View>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Status Visual */}
          <View style={styles.visualContainer}>
            <LinearGradient colors={['rgba(59, 130, 246, 0.1)', 'transparent']} style={styles.glowCircle}>
              <View style={styles.innerCircle}>
                <Ionicons
                  name={steps.find(s => s.key === currentStatus)?.icon as any || 'flash'}
                  size={60}
                  color="#3b82f6"
                />
              </View>
            </LinearGradient>
            <Text style={styles.statusTitle}>{currentStatus.toUpperCase()}</Text>
            <Text style={styles.statusSubtitle}>Event captured on NileLink Ledger</Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            {steps.map((step, idx) => {
              const isPast = steps.findIndex(s => s.key === currentStatus) >= idx;
              const isActive = step.key === currentStatus;

              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.indicatorCol}>
                    <View style={[styles.stepDot, isPast && styles.stepDotActive, isActive && styles.stepDotGlow]}>
                      {isPast && !isActive && <Ionicons name="checkmark" size={12} color="#fff" />}
                      {isActive && <View style={styles.pulseDot} />}
                    </View>
                    {idx < steps.length - 1 && <View style={[styles.connector, isPast && styles.connectorActive]} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, isPast && styles.stepLabelActive]}>{step.label}</Text>
                    <Text style={styles.stepTime}>{isPast ? 'Synced at 14:2' + idx : 'Pending...'}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Technical Info (Premium feel) */}
          <View style={styles.techInfo}>
            <View style={styles.techRow}>
              <Ionicons name="cube-outline" size={16} color="rgba(255,255,255,0.3)" />
              <Text style={styles.techText}>Block Hash: 0x4f...a23e</Text>
            </View>
            <View style={styles.techRow}>
              <Ionicons name="wifi-outline" size={16} color="rgba(255,255,255,0.3)" />
              <Text style={styles.techText}>Latency: 12ms (via Cairo-North-1)</Text>
            </View>
          </View>

          {/* Map Simulation / Visual */}
          <View style={styles.mapStub}>
            <LinearGradient colors={['#222', '#111']} style={styles.mapGradient}>
              <Ionicons name="navigate-circle" size={40} color="#3b82f6" opacity={0.5} />
              <Text style={styles.mapText}>Real-time Map tracking unavailable in v0.1</Text>
            </LinearGradient>
          </View>
        </ScrollView>

        <SafeAreaView style={styles.footer}>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Contact Node Manager</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullGradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  orderIdText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerStatusText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  edgeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6', marginRight: 6 },
  edgeText: { color: '#3b82f6', fontSize: 10, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  visualContainer: { alignItems: 'center', marginVertical: 40 },
  glowCircle: { width: 140, height: 140, borderRadius: 70, padding: 10, alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  statusTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 20, letterSpacing: -1 },
  statusSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', marginTop: 5 },
  timelineCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  stepRow: { flexDirection: 'row', height: 70 },
  indicatorCol: { width: 30, alignItems: 'center' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepDotActive: { backgroundColor: '#3b82f6' },
  stepDotGlow: { shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  connector: { width: 2, height: 50, backgroundColor: '#222', position: 'absolute', top: 20 },
  connectorActive: { backgroundColor: '#3b82f6' },
  stepContent: { marginLeft: 15 },
  stepLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '700' },
  stepLabelActive: { color: '#fff' },
  stepTime: { color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4, fontWeight: '600' },
  techInfo: { marginTop: 30, alignItems: 'center' },
  techRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  techText: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginLeft: 6, fontFamily: 'monospace' },
  mapStub: { height: 120, borderRadius: 24, overflow: 'hidden', marginTop: 30 },
  mapGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 10, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 },
  actionButton: { height: 56, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#000', fontSize: 15, fontWeight: '800' }
});