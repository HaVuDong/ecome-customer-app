import apiClient from './api';
import { ProductResponse } from './productService';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class RecommendationService {
  /**
   * Lấy sản phẩm gợi ý cá nhân hóa
   */
  async getPersonalizedRecommendations(limit = 20): Promise<ApiResponse<ProductResponse[]>> {
    const response = await apiClient.get('/recommendations/for-you', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Sản phẩm tương tự
   */
  async getSimilarProducts(productId: number, limit = 10): Promise<ApiResponse<ProductResponse[]>> {
    const response = await apiClient.get(`/recommendations/similar/${productId}`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Sản phẩm thường được mua cùng
   */
  async getFrequentlyBoughtTogether(productId: number, limit = 10): Promise<ApiResponse<ProductResponse[]>> {
    const response = await apiClient.get(`/recommendations/bought-together/${productId}`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Sản phẩm trending
   */
  async getTrendingProducts(limit = 20, days = 7): Promise<ApiResponse<ProductResponse[]>> {
    const response = await apiClient.get('/recommendations/trending', {
      params: { limit, days },
    });
    return response.data;
  }

  /**
   * Sản phẩm phổ biến trong khu vực
   */
  async getPopularInArea(province?: string, limit = 20): Promise<ApiResponse<ProductResponse[]>> {
    const response = await apiClient.get('/recommendations/popular-in-area', {
      params: { province, limit },
    });
    return response.data;
  }

  /**
   * Track hành vi người dùng
   */
  async trackBehavior(
    action: 'VIEW' | 'ADD_TO_CART' | 'SEARCH' | 'PURCHASE' | 'WISHLIST',
    params: {
      productId?: number;
      categoryId?: number;
      searchQuery?: string;
      deviceType?: string;
    }
  ): Promise<void> {
    try {
      await apiClient.post('/recommendations/track', null, {
        params: { 
          action, 
          productId: params.productId,
          categoryId: params.categoryId,
          searchQuery: params.searchQuery,
          deviceType: params.deviceType || 'mobile'
        },
      });
    } catch (error) {
      // Silent fail - tracking không nên làm crash app
      console.log('Tracking error:', error);
    }
  }

  /**
   * Helper: Track khi user xem sản phẩm
   */
  trackProductView(productId: number): void {
    this.trackBehavior('VIEW', { productId });
  }

  /**
   * Helper: Track khi user thêm vào giỏ
   */
  trackAddToCart(productId: number): void {
    this.trackBehavior('ADD_TO_CART', { productId });
  }

  /**
   * Helper: Track khi user search
   */
  trackSearch(searchQuery: string): void {
    this.trackBehavior('SEARCH', { searchQuery });
  }
}

export default new RecommendationService();
