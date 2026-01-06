import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import recommendationService from '../../../core/services/recommendationService';
import { ProductResponse } from '../../../core/services/productService';
import { ProductCard } from '../../product/components/ProductCard';
import { Product } from '../../../shared/types';

interface RecommendationSectionProps {
  onProductClick: (product: Product) => void;
}

export function RecommendationSection({ onProductClick }: RecommendationSectionProps) {
  const [forYouProducts, setForYouProducts] = useState<ProductResponse[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending'>('forYou');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const [forYouRes, trendingRes] = await Promise.allSettled([
        recommendationService.getPersonalizedRecommendations(10),
        recommendationService.getTrendingProducts(10, 7),
      ]);

      if (forYouRes.status === 'fulfilled' && forYouRes.value.success) {
        setForYouProducts(forYouRes.value.data);
      }

      if (trendingRes.status === 'fulfilled' && trendingRes.value.success) {
        setTrendingProducts(trendingRes.value.data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiProductToProduct = (apiProduct: ProductResponse): Product => ({
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice,
    image: apiProduct.mainImage || 'https://via.placeholder.com/200',
    rating: apiProduct.rating || 0,
    sold: apiProduct.soldCount,
    discount: apiProduct.originalPrice
      ? Math.round(((apiProduct.originalPrice - apiProduct.price) / apiProduct.originalPrice) * 100)
      : undefined,
    category: apiProduct.category?.name || 'Khác',
    description: apiProduct.description || '',
    stock: apiProduct.stock,
    images: apiProduct.mainImage ? [apiProduct.mainImage] : [],
    shop: {
      name: apiProduct.seller?.fullName || 'Shop',
      rating: 4.5,
      products: 100,
      responseRate: 95,
      responseTime: '1 giờ',
      followers: 1000,
    },
  });

  const currentProducts = activeTab === 'forYou' ? forYouProducts : trendingProducts;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    );
  }

  if (currentProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'forYou' && styles.tabActive]}
            onPress={() => setActiveTab('forYou')}
          >
            <Ionicons
              name="heart"
              size={16}
              color={activeTab === 'forYou' ? '#F97316' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
              Dành cho bạn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
            onPress={() => setActiveTab('trending')}
          >
            <Ionicons
              name="flame"
              size={16}
              color={activeTab === 'trending' ? '#F97316' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
              Đang thịnh hành
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {currentProducts.map((product, index) => (
          <View key={`${activeTab}-${product.id}-${index}`} style={styles.productWrapper}>
            <ProductCard
              product={mapApiProductToProduct(product)}
              onPress={(p) => onProductClick(p)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FEF3C7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#F97316',
  },
  productsContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  productWrapper: {
    width: 150,
  },
});
