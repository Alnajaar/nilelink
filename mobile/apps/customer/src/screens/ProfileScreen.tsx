import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Image, Dimensions, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export function ProfileScreen() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [language, setLanguage] = useState('English');

  const user = {
    name: 'Ahmed Mohamed',
    phone: '+20 123 456 7890',
    email: 'ahmed@example.com',
    memberSince: 'December 2024',
  };

  const stats = {
    totalOrders: 47,
    totalSpent: 523.80,
    averageRating: 4.8,
  };

  const menuItems = [
    {
      category: 'Orders',
      items: [
        { icon: 'time-outline', title: 'Order History', subtitle: 'View your past orders', screen: 'OrderHistory' },
        { icon: 'heart-outline', title: 'Favorites', subtitle: 'Your favorite restaurants', screen: 'Favorites' },
        { icon: 'location-outline', title: 'Addresses', subtitle: 'Manage delivery addresses', screen: 'Addresses' },
      ]
    },
    {
      category: 'Payment',
      items: [
        { icon: 'card-outline', title: 'Payment Methods', subtitle: 'Manage cards and wallets', screen: 'PaymentMethods' },
        { icon: 'receipt-outline', title: 'Transaction History', subtitle: 'View all transactions', screen: 'Transactions' },
      ]
    },
    {
      category: 'Settings',
      items: [
        { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Order updates and promotions', isSwitch: true, value: notificationsEnabled, onToggle: setNotificationsEnabled },
        { icon: 'finger-print-outline', title: 'Biometric Login', subtitle: 'Use Face ID or Touch ID', isSwitch: true, value: biometricEnabled, onToggle: setBiometricEnabled },
        { icon: 'globe-outline', title: 'Language', subtitle: language, screen: 'Language' },
        { icon: 'shield-checkmark-outline', title: 'Privacy & Security', subtitle: 'Manage your privacy settings', screen: 'Privacy' },
      ]
    },
    {
      category: 'Support',
      items: [
        { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get help with your orders', screen: 'Support' },
        { icon: 'information-circle-outline', title: 'About', subtitle: 'App version and information', screen: 'About' },
      ]
    },
  ];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const handleLogout = () => {
    navigation.navigate('Welcome' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#dc3545" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#0d6efd" />
            </View>
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </Pressable>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatCurrency(stats.totalSpent)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            
            {section.items.map((item, itemIndex) => (
              <Pressable
                key={itemIndex}
                style={styles.menuItem}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen as never);
                  } else if (item.onToggle) {
                    item.onToggle(!item.value);
                  }
                }}
              >
                <View style={styles.itemIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#0d6efd" />
                </View>
                
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                
                <View style={styles.itemAction}>
                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#e9ecef', true: '#0d6efd' }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Ionicons name="chevron-forward-outline" size={20} color="#6c757d" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="gift-outline" size={24} color="#0d6efd" />
            <Text style={styles.actionText}>Invite Friends</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Ionicons name="wallet-outline" size={24} color="#28a745" />
            <Text style={styles.actionText}>Add Money</Text>
          </Pressable>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Ionicons name="phone-portrait-outline" size={32} color="#adb5bd" />
          <Text style={styles.versionText}>NileLink Customer v0.1.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ in Cairo</Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    color: '#adb5bd',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e9ecef',
  },
  menuSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
  itemAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  versionText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  versionSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#adb5bd',
  },
});