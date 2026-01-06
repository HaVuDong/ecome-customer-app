import apiClient from './api';

export interface CategoryResponse {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  productCount?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class CategoryService {
  // Lấy tất cả danh mục
  async getAllCategories(): Promise<CategoryResponse[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  }

  // Lấy danh mục theo ID
  async getCategoryById(id: number): Promise<CategoryResponse> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }

  // Lấy danh mục active
  async getActiveCategories(): Promise<CategoryResponse[]> {
    const categories = await this.getAllCategories();
    return categories.filter(cat => cat.isActive);
  }

  // Map icon name to Ionicons
  getCategoryIcon(iconName?: string): string {
    const iconMap: Record<string, string> = {
      phone: 'phone-portrait-outline',
      laptop: 'laptop-outline',
      fashion: 'shirt-outline',
      home: 'home-outline',
      beauty: 'sparkles-outline',
      sports: 'football-outline',
      books: 'book-outline',
      food: 'fast-food-outline',
      toys: 'game-controller-outline',
      health: 'medical-outline',
      default: 'grid-outline',
    };
    return iconMap[iconName || 'default'] || iconMap.default;
  }
}

export default new CategoryService();
