import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

export function ProfileView() {
  const menuItems: MenuItem[] = [
    {
      icon: 'bag-handle-outline',
      label: 'Đơn mua',
      value: '3 đơn hàng',
      color: '#3B82F6',
    },
    {
      icon: 'heart-outline',
      label: 'Sản phẩm yêu thích',
      value: '12 sản phẩm',
      color: '#EF4444',
    },
    {
      icon: 'star-outline',
      label: 'Đánh giá của tôi',
      value: '8 đánh giá',
      color: '#FBBF24',
    },
  ];

  const settingItems: SettingItem[] = [
    { icon: 'location-outline', label: 'Địa chỉ nhận hàng' },
    { icon: 'card-outline', label: 'Thẻ thanh toán' },
    { icon: 'settings-outline', label: 'Cài đặt tài khoản' },
    { icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ' },
  ];

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
            <Text style={styles.userName}>Nguyễn Văn A</Text>
            <Text style={styles.userBadge}>VIP Member</Text>
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
        >
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
  userBadge: {
    fontSize: 14,
    color: '#FED7AA',
    marginTop: 4,
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
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
  },
});
