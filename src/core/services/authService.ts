import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  // Đăng nhập
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  // Đăng ký với role mặc định là CUSTOMER
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', {
      ...data,
      role: 'CUSTOMER', // Luôn set role là CUSTOMER cho app này
    });
    return response.data;
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  // Cập nhật thông tin user
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }
}

export default new AuthService();
