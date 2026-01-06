import apiClient from './api';

export interface ReviewResponse {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  product: {
    id: number;
    name: string;
    mainImage?: string;
  };
}

export interface ReviewRequest {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class ReviewService {
  // Lấy reviews của sản phẩm
  async getProductReviews(productId: number, page = 0, size = 10): Promise<ApiResponse<PageResponse<ReviewResponse>>> {
    const response = await apiClient.get(`/reviews/product/${productId}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Tạo review mới
  async createReview(request: ReviewRequest): Promise<ApiResponse<ReviewResponse>> {
    const response = await apiClient.post('/reviews', request);
    return response.data;
  }

  // Cập nhật review
  async updateReview(reviewId: number, rating: number, comment?: string): Promise<ApiResponse<ReviewResponse>> {
    const response = await apiClient.put(`/reviews/${reviewId}`, { rating, comment });
    return response.data;
  }

  // Xóa review
  async deleteReview(reviewId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Lấy reviews của user hiện tại
  async getMyReviews(page = 0, size = 10): Promise<ApiResponse<PageResponse<ReviewResponse>>> {
    const response = await apiClient.get('/reviews/me', {
      params: { page, size },
    });
    return response.data;
  }

  // Lấy thống kê rating của sản phẩm
  async getProductRatingStats(productId: number): Promise<ApiResponse<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }>> {
    const response = await apiClient.get(`/reviews/product/${productId}/stats`);
    return response.data;
  }

  // Kiểm tra user đã review sản phẩm chưa
  async canReviewProduct(productId: number, orderId: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/reviews/can-review`, {
        params: { productId, orderId },
      });
      return response.data.data || false;
    } catch {
      return false;
    }
  }

  // Render stars
  renderStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}

export default new ReviewService();
