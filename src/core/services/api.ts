import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, logNetworkConfig } from '../config/network';

/**
 * API Configuration
 * 
 * 🟢 Sử dụng cấu hình từ src/core/config/network.ts
 * Đổi USE_PRODUCTION = true/false để chuyển giữa Render và Local
 */

const API_BASE_URL = getApiUrl();

// Log config khi khởi động
logNetworkConfig();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s cho Render free tier cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attempt to prefer Render (production). If FORCE_PRODUCTION is enabled, use production and do not fallback.
(async function preferRenderThenLocal() {
  try {
    const network = await import('../config/network');
    if (network.FORCE_PRODUCTION) {
      const prod = `${network.PRODUCTION_URL}/api`;
      console.log('⚡ NETWORK: FORCE_PRODUCTION enabled, using', prod);
      apiClient.defaults.baseURL = prod;
      return;
    }
    const resolved = await network.resolveApiUrl(3000);
    if (!resolved) return;
    if (apiClient.defaults.baseURL !== resolved) {
      console.log('⚡ NETWORK: Switching API baseURL to', resolved);
      apiClient.defaults.baseURL = resolved;
    }
  } catch (err) {
    console.warn('⚠️ NETWORK: Failed to resolve production API, keep configured baseURL', apiClient.defaults.baseURL);
  }
})();

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
