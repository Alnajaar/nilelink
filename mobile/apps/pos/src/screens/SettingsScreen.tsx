
import React from 'react';
import {
    View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
    StatusBar, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { posActions } from '../store/posSlice'; // Assumes logout actions or similar exist, or just clear order
import type { PosState } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

export function SettingsScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { restaurantName, shift, isConnected, pendingSyncCount } = useSelector<{ pos: PosState }, PosState>(s => s.pos);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? Any unsynced data will be preserved on device.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructuve',
                    onPress: () => {
                        // In real app, clear auth token
                        navigation.navigate('Login' as never);
                    }
                }
            ]
        );
    };

    const menuItems = [
        {
            title: 'Shift Management',
            subtitle: shift ? (shift.status === 'OPEN' ? 'Shift Open' : 'Shift Closed') : 'Start Shift',
            icon: 'wallet-outline',
            action: () => navigation.navigate('ShiftManagement' as never),
            color: '#0d6efd'
        },
        {
            title: 'Sync Status',
            subtitle: isConnected ? (pendingSyncCount > 0 ? `${pendingSyncCount} pending items` : 'All synced') : 'Offline',
            icon: 'sync-outline',
            action: () => dispatch(posActions.syncRequested()),
            color: isConnected ? '#198754' : '#dc3545'
        },
        {
            title: 'Printers & Devices',
            subtitle: 'Star Micronics TSP143 configured',
            icon: 'print-outline',
            action: () => Alert.alert('Printers', 'Printer configuration would open here.'),
            color: '#6c757d'
        },
        {
            title: 'General Settings',
            subtitle: 'Language, Timezone',
            icon: 'settings-outline',
            action: () => { },
            color: '#6c757d'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.restaurantName}>{restaurantName || 'Demo Restaurant'}</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Store Management</Text>
                <View style={styles.menuGroup}>
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.menuItem}
                            onPress={item.action}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <View style={styles.menuInfo}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuGroup}>
                    <Pressable style={styles.menuItem} onPress={handleLogout}>
                        <View style={[styles.iconBox, { backgroundColor: '#dc354520' }]}>
                            <Ionicons name="log-out-outline" size={24} color="#dc3545" />
                        </View>
                        <View style={styles.menuInfo}>
                            <Text style={[styles.menuTitle, { color: '#dc3545' }]}>Logout</Text>
                            <Text style={styles.menuSubtitle}>Sign out of this device</Text>
                        </View>
                    </Pressable>
                </View>

                <Text style={styles.versionText}>NileLink POS v0.1.0 (Build 452)</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4
    },
    restaurantName: {
        fontSize: 16,
        color: '#6c757d'
    },
    content: {
        flex: 1,
        padding: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    menuGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 24
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    menuInfo: {
        flex: 1
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#6c757d'
    },
    versionText: {
        textAlign: 'center',
        color: '#adb5bd',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40
    }
});
