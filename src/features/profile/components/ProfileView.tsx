import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../shared/contexts/AuthContext';
import orderService from '../../../core/services/orderService';
import wishlistService from '../../../core/services/wishlistService';
import reviewService from '../../../core/services/reviewService';

interface ProfileViewProps {
  onNavigateToOrders?: () => void;
  onNavigateToWishlist?: () => void;
  onNavigateToReviews?: () => void;
  onNavigateToSettings?: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  onPress?: () => void;
}

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

export function ProfileView({
  onNavigateToOrders,
  onNavigateToWishlist,
  onNavigateToReviews,
  onNavigateToSettings,
}: ProfileViewProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    orderCount: 0,
    wishlistCount: 0,
    reviewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      
      // Load stats in parallel
      const [ordersRes, wishlistCountRes, reviewsRes] = await Promise.allSettled([
        orderService.getMyOrders(0, 1),
        wishlistService.countWishlist(),
        reviewService.getMyReviews(0, 1),
      ]);

      setStats({
        orderCount: ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.totalElements || 0) : 0,
        wishlistCount: wishlistCountRes.status === 'fulfilled' ? (wishlistCountRes.value.data?.count || 0) : 0,
        reviewCount: reviewsRes.status === 'fulfilled' ? (reviewsRes.value.data?.totalElements || 0) : 0,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'bag-handle-outline',
      label: 'Đơn mua',
      value: `${stats.orderCount} đơn hàng`,
      color: '#3B82F6',
      onPress: onNavigateToOrders,
    },
    {
      icon: 'heart-outline',
      label: 'Yêu thích',
      value: `${stats.wishlistCount} sản phẩm`,
      color: '#EF4444',
      onPress: onNavigateToWishlist,
    },
    {
      icon: 'star-outline',
      label: 'Đánh giá',
      value: `${stats.reviewCount} đánh giá`,
      color: '#FBBF24',
      onPress: onNavigateToReviews,
    },
  ];

  const settingItems: SettingItem[] = [
    { icon: 'location-outline', label: 'Địa chỉ nhận hàng' },
    { icon: 'card-outline', label: 'Thẻ thanh toán' },
    { icon: 'settings-outline', label: 'Cài đặt tài khoản', onPress: onNavigateToSettings },
    { icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#F97316" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Khách hàng'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <Text style={styles.userBadge}>Khách hàng</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statItem}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={[styles.statIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsCard}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Tiện ích</Text>
        </View>
        {settingItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingItem,
              index === settingItems.length - 1 && styles.settingItemLast
            ]}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={20} color="#6B7280" />
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutCard}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userEmail: {
    fontSize: 13,
    color: '#FED7AA',
    marginTop: 2,
  },
  userBadge: {
    fontSize: 12,
    color: '#FED7AA',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  settingsCard: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  settingsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
  logoutCard: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
