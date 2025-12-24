import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_JOBS = [
    { id: 'ORD-101', restaurant: 'Cairo Kitchen', total: 24.50, distance: '1.2 km', address: '123 Nile St.', branch: 'Maadi' },
    { id: 'ORD-102', restaurant: 'Giza Grill', total: 18.00, distance: '3.5 km', address: '45 Pyramid Ave.', branch: 'Haram' },
];

export function JobSelectionScreen() {
    const navigation = useNavigation();

    const handleAccept = (job: any) => {
        navigation.navigate('ActiveDelivery' as never, { job } as any);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#050505', '#111']} style={styles.fullBg}>

                <SafeAreaView>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerStatus}>NETWORK ACTIVE • NILE-EDGE</Text>
                            <Text style={styles.headerTitle}>Available Jobs</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <Pressable
                                onPress={() => navigation.navigate('CashSummary' as never)}
                                style={styles.cashButton}
                            >
                                <Ionicons name="wallet" size={20} color="#3b82f6" />
                                <Text style={styles.cashText}>$145.50</Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Info Bar */}
                <View style={styles.infoBar}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>EARNINGS TODAY</Text>
                        <Text style={styles.infoValue}>$42.00</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>COMPLETED</Text>
                        <Text style={styles.infoValue}>6 Jobs</Text>
                    </View>
                </View>

                <FlatList
                    data={MOCK_JOBS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }) => (
                        <View style={styles.jobCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.restaurantInfo}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="restaurant" size={20} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text style={styles.restaurantName}>{item.restaurant}</Text>
                                        <Text style={styles.branchName}>{item.branch}</Text>
                                    </View>
                                </View>
                                <Text style={styles.jobPrice}>${item.total.toFixed(2)}</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.addressRow}>
                                <Ionicons name="location" size={16} color="#666" />
                                <Text style={styles.addressText}>{item.address}</Text>
                                <View style={styles.distBadge}>
                                    <Text style={styles.distText}>{item.distance}</Text>
                                </View>
                            </View>

                            <Pressable
                                style={styles.acceptButton}
                                onPress={() => handleAccept(item)}
                            >
                                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.btnGradient}>
                                    <Text style={styles.acceptText}>ACCEPT JOB</Text>
                                    <Ionicons name="flash" size={16} color="#fff" />
                                </LinearGradient>
                            </Pressable>
                        </View>
                    )}
                />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fullBg: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
    headerStatus: { color: '#3b82f6', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    headerTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    cashButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    cashText: { color: '#fff', fontSize: 13, fontWeight: '800', marginLeft: 6 },
    infoBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: 25,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20
    },
    infoItem: { flex: 1, alignItems: 'center' },
    infoLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '800' },
    infoValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
    infoDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' },
    list: { padding: 25, paddingTop: 0 },
    jobCard: {
        backgroundColor: '#111',
        borderRadius: 28,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    restaurantInfo: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    restaurantName: { color: '#fff', fontSize: 18, fontWeight: '800' },
    branchName: { color: '#666', fontSize: 12, fontWeight: '600', marginTop: 2 },
    jobPrice: { color: '#fff', fontSize: 24, fontWeight: '900' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 18 },
    addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    addressText: { color: '#bbb', fontSize: 14, fontWeight: '600', flex: 1, marginLeft: 8 },
    distBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    distText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    acceptButton: { height: 56, borderRadius: 18, overflow: 'hidden' },
    btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    acceptText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, marginRight: 8 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
});
