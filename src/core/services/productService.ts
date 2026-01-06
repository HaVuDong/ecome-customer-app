import apiClient from './api';

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  mainImage?: string;
  rating?: number;
  soldCount: number;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: number;
    username?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
  category: {
    id: number;
    name: string;
    icon?: string;
  };
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

class ProductService {
  // Lấy tất cả sản phẩm
  async getAllProducts(page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get('/products', {
      params: { page, size, sortBy: 'createdAt', direction: 'DESC' },
    });
    return response.data;
  }

  // Lấy chi tiết sản phẩm
  async getProductById(id: number): Promise<ProductResponse> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }

  // Lấy sản phẩm theo danh mục
  async getProductsByCategory(categoryId: number, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get(`/products/category/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Tìm kiếm sản phẩm
  async searchProducts(keyword: string, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get('/products/search', {
      params: { keyword, page, size },
    });
    return response.data;
  }

  // Tìm kiếm nâng cao
  async searchProductsAdvanced(params: {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<PageResponse<ProductResponse>>> {
    const response = await apiClient.get('/products/search/advanced', { params });
    return response.data;
  }

  // Sản phẩm bán chạy
  async getTopSellingProducts(): Promise<ProductResponse[]> {
    const response = await apiClient.get('/products/top-selling');
    return response.data;
  }

  // Sản phẩm mới nhất
  async getNewestProducts(): Promise<ProductResponse[]> {
    const response = await apiClient.get('/products/newest');
    return response.data;
  }

  // Lấy sản phẩm của seller
  async getProductsBySeller(sellerId: number, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    const response = await apiClient.get(`/products/seller/${sellerId}`, {
      params: { page, size },
    });
    return response.data;
  }

  // Format giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  }

  // Tính % giảm giá
  calculateDiscount(price: number, originalPrice?: number): number {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
}

export default new ProductService();
