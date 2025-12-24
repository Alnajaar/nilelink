import React, { useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Dimensions, SafeAreaView, StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { posActions } from '../store/posSlice';
import { useNavigation } from '@react-navigation/native';
import type { PosState } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export function DashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const state = useSelector<{ pos: PosState }, PosState>(s => s.pos);

  const { pendingSyncCount, lastSyncStatus, isConnected, restaurantName } = state;

  const metrics = [
    { title: 'Gross Revenue', value: '$1,485.50', trend: '+12%', icon: 'cash', color: '#3b82f6' },
    { title: 'Orders Today', value: '32', trend: '+5', icon: 'receipt', color: '#8b5cf6' },
    { title: 'Avg Quality', value: '4.8', trend: 'High', icon: 'star', color: '#fbbf24' },
    { title: 'Edge Sync', value: 'Healthy', trend: '12ms', icon: 'pulse', color: '#10b981' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#050505', '#111']} style={styles.fullBg}>

        {/* Header */}
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>SYSTEM ACTIVE</Text>
              <Text style={styles.restaurantName}>{restaurantName || 'NileLink Node'}</Text>
            </View>
            <View style={styles.headerRight}>
              {pendingSyncCount > 0 && (
                <View style={styles.syncIndicator}>
                  <Text style={styles.syncCount}>{pendingSyncCount}</Text>
                </View>
              )}
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Main Action Buttons */}
          <View style={styles.actionGrid}>
            <Pressable
              style={[styles.mainAction, styles.primaryAction]}
              onPress={() => navigation.navigate('NewOrder' as never)}
            >
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.actionGradient}>
                <Ionicons name="add-circle" size={32} color="#fff" />
                <Text style={styles.actionTitle}>NEW ORDER</Text>
                <Text style={styles.actionSub}>Quick Terminal</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.mainAction}
              onPress={() => navigation.navigate('Inventory' as never)}
            >
              <View style={styles.glassAction}>
                <Ionicons name="cube" size={28} color="#8b5cf6" />
                <Text style={styles.actionTitle}>INVENTORY</Text>
                <Text style={styles.actionSub}>Auto-Deducted</Text>
              </View>
            </Pressable>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {metrics.map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: m.color + '10' }]}>
                  <Ionicons name={m.icon as any} size={18} color={m.color} />
                </View>
                <Text style={styles.metricLabel}>{m.title}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
                <View style={styles.trendRow}>
                  <Text style={[styles.trendText, { color: m.color }]}>{m.trend}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Access List */}
          <Text style={styles.sectionHeader}>Recent System Events</Text>
          <View style={styles.eventList}>
            {[
              { id: '1', type: 'SALE', desc: 'Order #319 Complete', time: '2m ago' },
              { id: '2', type: 'SYNC', desc: 'Edge Ledger Anchored', time: '14m ago' },
              { id: '3', type: 'STOCK', desc: 'Flour Low (Auto-Alert)', time: '1h ago' },
            ].map((ev) => (
              <View key={ev.id} style={styles.eventItem}>
                <View style={styles.eventIndicator} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventDesc}>{ev.desc}</Text>
                  <Text style={styles.eventTime}>{ev.time} • NileLink-TX-{ev.id}</Text>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>

        {/* Global Footer Navigation */}
        <SafeAreaView style={styles.bottomNav}>
          <View style={styles.navInner}>
            <Ionicons name="home" size={24} color="#3b82f6" />
            <Ionicons name="list" size={24} color="#444" onPress={() => navigation.navigate('KitchenDisplay' as never)} />
            <View style={styles.centerNav}>
              <Ionicons name="grid" size={24} color="#fff" />
            </View>
            <Ionicons name="people" size={24} color="#444" onPress={() => navigation.navigate('ShiftManagement' as never)} />
            <Ionicons name="settings" size={24} color="#444" onPress={() => navigation.navigate('Settings' as never)} />
          </View>
        </SafeAreaView>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullBg: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  welcomeText: { color: '#3b82f6', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  restaurantName: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 15 },
  syncIndicator: { backgroundColor: '#ef4444', height: 20, paddingHorizontal: 8, borderRadius: 10, justifyContent: 'center' },
  syncCount: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  mainAction: { flex: 1, height: 160, borderRadius: 30, overflow: 'hidden' },
  primaryAction: { shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  actionGradient: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  glassAction: { flex: 1, padding: 20, justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 10 },
  actionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
  metricCard: { width: (width - 55) / 2, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  metricLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  metricValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  trendRow: { marginTop: 8 },
  trendText: { fontSize: 10, fontWeight: '800' },
  sectionHeader: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  eventList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 10 },
  eventItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  eventIndicator: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#3b82f6', marginRight: 15 },
  eventContent: { flex: 1 },
  eventDesc: { color: '#fff', fontSize: 14, fontWeight: '600' },
  eventTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  navInner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70 },
  centerNav: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3b82f6' },
});