import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export function ActiveDeliveryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { job }: any = route.params;
    const [status, setStatus] = useState<'ACCEPTED' | 'PICKED_UP' | 'DELIVERED'>('ACCEPTED');

    const handleUpdate = () => {
        if (status === 'ACCEPTED') setStatus('PICKED_UP');
        else if (status === 'PICKED_UP') setStatus('DELIVERED');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#050505', '#111']} style={styles.fullBg}>

                <SafeAreaView>
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </Pressable>
                        <View style={styles.headerTextWrapper}>
                            <Text style={styles.headerSync}>SYNCING WITH CLIENT NODE...</Text>
                            <Text style={styles.headerTitle}>Delivery Workflow</Text>
                        </View>
                    </View>
                </SafeAreaView>

                <View style={styles.content}>
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.stepBox}>
                            <View style={[styles.stepCircle, status !== 'ACCEPTED' && styles.stepCompleted]}>
                                <Ionicons name={status !== 'ACCEPTED' ? "checkmark" : "restaurant"} size={16} color="#fff" />
                            </View>
                            <Text style={[styles.stepLabel, status !== 'ACCEPTED' && styles.stepLabelActive]}>Pickup</Text>
                        </View>
                        <View style={[styles.line, status !== 'ACCEPTED' && styles.lineActive]} />
                        <View style={styles.stepBox}>
                            <View style={[styles.stepCircle, status === 'DELIVERED' && styles.stepCompleted]}>
                                <Ionicons name={status === 'DELIVERED' ? "checkmark" : "home"} size={16} color="#fff" />
                            </View>
                            <Text style={[styles.stepLabel, status === 'DELIVERED' && styles.stepLabelActive]}>Delivery</Text>
                        </View>
                    </View>

                    {/* Main Info Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.customerRow}>
                            <View>
                                <Text style={styles.destinationLabel}>DESTINATION</Text>
                                <Text style={styles.addressName}>{job.restaurant}</Text>
                                <Text style={styles.addressSub}>{job.address}</Text>
                            </View>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceText}>${job.total.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>ORDER ID</Text>
                                <Text style={styles.detailValue}>{job.id}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>DISTANCE</Text>
                                <Text style={styles.detailValue}>{job.distance}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Hub */}
                    <View style={styles.actionHub}>
                        {status !== 'DELIVERED' ? (
                            <Pressable style={styles.mainAction} onPress={handleUpdate}>
                                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.actionGradient}>
                                    <Text style={styles.actionText}>
                                        {status === 'ACCEPTED' ? 'CONFIRM PICKUP' : 'CONFIRM DELIVERY'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                                </LinearGradient>
                            </Pressable>
                        ) : (
                            <View style={styles.doneWrapper}>
                                <View style={styles.successIcon}>
                                    <Ionicons name="checkmark-circle" size={60} color="#10b981" />
                                </View>
                                <Text style={styles.doneTitle}>Job Completed</Text>
                                <Text style={styles.doneSub}>Transaction hashed & anchored to Ledger.</Text>

                                <Pressable
                                    style={styles.finishButton}
                                    onPress={() => navigation.navigate('JobSelection' as never)}
                                >
                                    <Text style={styles.finishText}>Return to Marketplace</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>

                {/* Technical Protocol Footer */}
                <View style={styles.techFooter}>
                    <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.techText}>Protocol Verification v0.1.0 • P2P Envelopes Active</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBg: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 25 },
    backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    headerTextWrapper: { marginLeft: 15 },
    headerSync: { color: '#3b82f6', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    content: { flex: 1, padding: 25 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
    stepBox: { alignItems: 'center' },
    stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    stepCompleted: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    stepLabel: { color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: '800', marginTop: 8, textTransform: 'uppercase' },
    stepLabelActive: { color: '#fff' },
    line: { height: 2, width: 80, backgroundColor: '#222', marginHorizontal: 10, marginTop: -20 },
    lineActive: { backgroundColor: '#3b82f6' },
    glassCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    customerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    destinationLabel: { color: '#3b82f6', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
    addressName: { color: '#fff', fontSize: 22, fontWeight: '900' },
    addressSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600', marginTop: 4 },
    priceTag: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    priceText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 25 },
    detailsGrid: { flexDirection: 'row', gap: 40 },
    detailItem: {},
    detailLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
    detailValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
    actionHub: { flex: 1, justifyContent: 'flex-end', paddingBottom: 20 },
    mainAction: { height: 64, borderRadius: 20, overflow: 'hidden' },
    actionGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    actionText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1, marginRight: 10 },
    doneWrapper: { alignItems: 'center' },
    successIcon: { marginBottom: 15 },
    doneTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    doneSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 5, paddingHorizontal: 40 },
    finishButton: { marginTop: 30, paddingHorizontal: 30, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    finishText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    techFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
    techText: { color: 'rgba(255,255,255,0.15)', fontSize: 9, fontWeight: '600', marginLeft: 6, letterSpacing: 0.5 },
});
