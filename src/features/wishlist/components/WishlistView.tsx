import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import wishlistService, { WishlistResponse } from '../../../core/services/wishlistService';
import { useCart } from '../../../shared/contexts/CartContext';

interface WishlistViewProps {
  onProductPress?: (productId: number) => void;
  onBack?: () => void;
}

export function WishlistView({ onProductPress, onBack }: WishlistViewProps) {
  const [wishlist, setWishlist] = useState<WishlistResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.success && response.data) {
        // response.data là WishlistResponse[] trực tiếp
        setWishlist(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  }, [loadWishlist]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
    }
  };

  const handleAddToCart = async (productId: number) => {
    const success = await addToCart(productId, 1);
    if (success) {
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    } else {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const renderItem = ({ item }: { item: WishlistResponse }) => {
    const discount = calculateDiscount(item.product.price, item.product.originalPrice);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onProductPress?.(item.product.id)}
        activeOpacity={0.7}
      >
        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item.product.id)}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>

        {/* Product Image */}
        <Image
          source={{ uri: item.product.mainImage || 'https://via.placeholder.com/120' }}
          style={styles.productImage}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>

          {/* Rating */}
          {item.product.rating && item.product.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.product.rating.toFixed(1)}</Text>
              <Text style={styles.soldText}>Đã bán {item.product.soldCount || 0}</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatPrice(item.product.price)}</Text>
            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
              <Text style={styles.originalPrice}>{formatPrice(item.product.originalPrice)}</Text>
            )}
          </View>

          {/* Seller */}
          {item.product.seller && (
            <Text style={styles.sellerName} numberOfLines={1}>
              <Ionicons name="storefront-outline" size={11} color="#9CA3AF" />
              {' '}{item.product.seller.fullName}
            </Text>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item.product.id)}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
          <Text style={styles.headerSubtitle}>{wishlist.length} sản phẩm</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubtext}>
            Hãy thêm sản phẩm yêu thích của bạn vào đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F97316']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  soldText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  sellerName: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
