import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '@nilelink/mobile-shared';

export function CashSummaryScreen() {
    const navigation = useNavigation();

    const [summary, setSummary] = useState({
        totalCollected: 145.50,
        deliveriesCount: 8,
        pendingSettlement: 145.50,
        weeklyEarnings: 425.75,
        monthlyEarnings: 1850.25,
        averagePerDelivery: 18.10,
        history: [
            { id: '1', amount: 24.50, time: '14:20', status: 'COLLECTED', type: 'DELIVERY' },
            { id: '2', amount: 18.00, time: '13:45', status: 'COLLECTED', type: 'DELIVERY' },
            { id: '3', amount: 12.00, time: '12:15', status: 'COLLECTED', type: 'TIP' },
            { id: '4', amount: 15.75, time: '11:30', status: 'PENDING', type: 'DELIVERY' },
        ]
    });

    // Fetch real earnings data
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await api.get('/driver/earnings');
                if (response.data.success) {
                    setSummary(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.log('Could not fetch earnings:', error);
                // Keep mock data as fallback
            }
        };
        fetchEarnings();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Premium Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Cash Summary</Text>
                <Ionicons name="calendar-outline" size={24} color="#fff" />
            </View>

            <ScrollView style={styles.content}>
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>CASH IN HAND</Text>
                    <Text style={styles.balanceAmount}>${summary.pendingSettlement.toFixed(2)}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{summary.deliveriesCount}</Text>
                            <Text style={styles.statLabel}>Jobs Today</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>${summary.averagePerDelivery.toFixed(2)}</Text>
                            <Text style={styles.statLabel}>Avg/Job</Text>
                        </View>
                    </View>
                </View>

                {/* Earnings Overview */}
                <View style={styles.earningsCard}>
                    <Text style={styles.sectionTitle}>Earnings Overview</Text>
                    <View style={styles.earningsGrid}>
                        <View style={styles.earningItem}>
                            <Text style={styles.earningLabel}>This Week</Text>
                            <Text style={styles.earningValue}>${summary.weeklyEarnings.toFixed(2)}</Text>
                        </View>
                        <View style={styles.earningItem}>
                            <Text style={styles.earningLabel}>This Month</Text>
                            <Text style={styles.earningValue}>${summary.monthlyEarnings.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Button */}
                <Pressable style={styles.settleButton} onPress={() => alert('Settlement request recorded locally.')}>
                    <Text style={styles.settleButtonText}>Submit for Settlement</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </Pressable>

                {/* History Section */}
                <Text style={styles.sectionTitle}>Today's Earnings</Text>
                {summary.history.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                        <View style={styles.historyIcon}>
                            <Ionicons
                                name={item.type === 'TIP' ? 'heart' : 'cash-outline'}
                                size={20}
                                color={item.type === 'TIP' ? '#ff6b6b' : '#28a745'}
                            />
                        </View>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyText}>
                                {item.type === 'TIP' ? 'Tip Received' : 'Delivery Payment'}
                            </Text>
                            <Text style={styles.historyTime}>{item.time}</Text>
                        </View>
                        <View style={styles.historyAmountContainer}>
                            <Text style={[
                                styles.historyAmount,
                                item.status === 'PENDING' && styles.pendingAmount
                            ]}>
                                {item.status === 'PENDING' ? '~' : '+'}${item.amount.toFixed(2)}
                            </Text>
                            {item.status === 'PENDING' && (
                                <Text style={styles.pendingLabel}>Pending</Text>
                            )}
                        </View>
                    </View>
                ))}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#0d6efd" />
                    <Text style={styles.infoText}>
                        Keep your physical cash safe. You will need to settle this total at the restaurant branch before your next shift.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222'
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    backButton: { padding: 4 },
    content: { flex: 1, padding: 20 },
    balanceCard: {
        backgroundColor: '#0d6efd',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
    balanceAmount: { color: '#fff', fontSize: 48, fontWeight: '800', marginVertical: 10 },
    statsRow: { flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 20 },
    statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    statDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },
    settleButton: {
        backgroundColor: '#222',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        marginBottom: 30
    },
    settleButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222'
    },
    historyIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(40,167,69,0.1)', justifyContent: 'center', alignItems: 'center' },
    historyInfo: { flex: 1, marginLeft: 12 },
    historyText: { color: '#fff', fontWeight: '600' },
    historyTime: { color: '#666', fontSize: 12, marginTop: 2 },
    historyAmount: { color: '#fff', fontWeight: '700', fontSize: 16 },
    historyAmountContainer: { alignItems: 'flex-end' },
    pendingAmount: { color: '#fbbf24' },
    pendingLabel: { color: '#fbbf24', fontSize: 10, fontWeight: '600', marginTop: 2 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(13,110,253,0.05)',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(13,110,253,0.1)'
    },
    infoText: { color: '#666', fontSize: 12, flex: 1, marginLeft: 10, lineHeight: 18 },
    earningsCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    earningsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    earningItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5
    },
    earningLabel: {
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 5
    },
    earningValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800'
    }
});
