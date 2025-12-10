import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EnhancedHeaderProps {
  cartCount: number;
  notificationCount: number;
  onSearchClick: () => void;
  onCartClick: () => void;
  onQRClick: () => void;
}

export function EnhancedHeader({
  cartCount,
  notificationCount,
  onSearchClick,
  onCartClick,
  onQRClick,
}: EnhancedHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.leftIcons}>
          <TouchableOpacity onPress={onQRClick} style={styles.iconButton}>
            <Ionicons name="qr-code-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#ffffff" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onCartClick} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={22} color="#ffffff" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity onPress={onSearchClick} style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#f97316" />
        <Text style={styles.searchText}>Bạn cần tìm gì hôm nay?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
