import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { LOCAL_IP, logNetworkConfig } from '../config/network';

/**
 * API Configuration
 * 
 * 🔴 ĐỔI MẠNG WIFI? → Sửa IP trong file: src/core/config/network.ts
 */

const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }
  // Android/iOS thiết bị thật: dùng IP từ config
  return `http://${LOCAL_IP}:8080/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Log config khi khởi động
logNetworkConfig();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào mọi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('customer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      await AsyncStorage.removeItem('customer_token');
      await AsyncStorage.removeItem('customer_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
