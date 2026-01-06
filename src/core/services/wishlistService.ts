import apiClient from './api';

export interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    mainImage?: string;
    rating?: number;
    soldCount: number;
    seller: {
      id: number;
      fullName: string;
    };
  };
  createdAt: string;
}

export interface WishlistResponse {
  id: number;
  userId: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    mainImage?: string;
    rating?: number;
    soldCount: number;
    seller: {
      id: number;
      fullName: string;
    };
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class WishlistService {
  // Lấy danh sách yêu thích
  async getWishlist(): Promise<ApiResponse<WishlistResponse[]>> {
    const response = await apiClient.get('/wishlist');
    return response.data;
  }

  // Thêm sản phẩm vào wishlist
  async addToWishlist(productId: number): Promise<ApiResponse<WishlistResponse>> {
    const response = await apiClient.post(`/wishlist/${productId}`);
    return response.data;
  }

  // Xóa sản phẩm khỏi wishlist
  async removeFromWishlist(productId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  }

  // Toggle wishlist (thêm hoặc xóa)
  async toggleWishlist(productId: number): Promise<ApiResponse<{ isInWishlist: boolean; productId: number }>> {
    const response = await apiClient.post(`/wishlist/${productId}/toggle`);
    return response.data;
  }

  // Kiểm tra sản phẩm có trong wishlist không
  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/wishlist/check/${productId}`);
      return response.data.data?.isInWishlist || false;
    } catch {
      return false;
    }
  }

  // Lấy danh sách productIds trong wishlist
  async getWishlistProductIds(): Promise<ApiResponse<number[]>> {
    const response = await apiClient.get('/wishlist/product-ids');
    return response.data;
  }

  // Đếm số sản phẩm trong wishlist
  async countWishlist(): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.get('/wishlist/count');
    return response.data;
  }
}

export default new WishlistService();
