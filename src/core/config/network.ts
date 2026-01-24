/**
 * ============================================================
 * NETWORK CONFIGURATION - CẤU HÌNH MẠNG
 * ============================================================
 * 
 * � Backend đã deploy lên Render!
 * URL: https://backend-ecome-03zq.onrender.com
 * 
 * Để chuyển về local development, đổi USE_PRODUCTION = false
 */
import { Platform } from 'react-native';

// ============================================================
// 👇 CHUYỂN ĐỔI GIỮA PRODUCTION VÀ LOCAL 👇
// ============================================================
export const USE_PRODUCTION = true; // true = Render, false = Local
export const FORCE_PRODUCTION = true; // when true, do NOT fallback to local automatically
// ============================================================

// Production URL (Render)
export const PRODUCTION_URL = 'https://backend-ecome-03zq.onrender.com';

// Local development
// For local device testing on Android emulator use 10.0.2.2 (Android emulator -> host localhost)
// Auto-select host based on platform: Android emulator -> 10.0.2.2, others -> localhost.
// Use LAN IP of your computer for physical device testing (set by user)
export const DEFAULT_LOCAL_HOST = '10.133.77.162'; // set from ipconfig (your machine)
export const LOCAL_IP = DEFAULT_LOCAL_HOST; // change this value if you test with a different machine or network
export const API_PORT = '8080';

export const getApiUrl = () => {
  if (USE_PRODUCTION) {
    return `${PRODUCTION_URL}/api`;
  }
  return `http://${LOCAL_IP}:${API_PORT}/api`;
};

// URL để test kết nối backend
export const getHealthCheckUrl = (useProduction = USE_PRODUCTION) => {
  if (useProduction) {
    return `${PRODUCTION_URL}/api/categories`;
  }
  return `http://${LOCAL_IP}:${API_PORT}/api/categories`;
};

/**
 * Thử connect lên production (Render). Nếu thất bại trong timeout ms thì trả về local URL.
 * Trả về đầy đủ base API (ví dụ https://.../api or http://<ip>:8080/api)
 */
export const resolveApiUrl = async (timeoutMs = 3000): Promise<string> => {
  // If forced to production, don't attempt fallback
  if (FORCE_PRODUCTION) {
    return `${PRODUCTION_URL}/api`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(getHealthCheckUrl(true), { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      return `${PRODUCTION_URL}/api`;
    }
    // non-OK -> fallback
    return `http://${LOCAL_IP}:${API_PORT}/api`;
  } catch (err) {
    // network error or timeout -> fallback
    return `http://${LOCAL_IP}:${API_PORT}/api`;
  }
};

// Log IP khi app khởi động (debug)
export const logNetworkConfig = () => {
  console.log('========================================');
  console.log('📡 NETWORK CONFIG');
  console.log('========================================');
  console.log(`🌐 Mode: ${USE_PRODUCTION ? 'PRODUCTION (Render)' : 'LOCAL'}`);
  console.log(`🔗 API URL: ${getApiUrl()}`);
  console.log(`🧪 Test URL: ${getHealthCheckUrl()}`);
  console.log('========================================');
  if (USE_PRODUCTION) {
    console.log('✅ Đang sử dụng backend trên Render');
    console.log('⚠️  Nếu lỗi, kiểm tra backend đang active trên Render');
  } else {
    console.log('⚠️  Nếu lỗi Network Error:');
    console.log('   1. Kiểm tra Backend đang chạy');
    console.log('   2. Điện thoại cùng WiFi với máy tính');
    console.log('   3. Chạy "ipconfig" để lấy IP mới');
    console.log('   4. Sửa IP trong src/core/config/network.ts');
  }
  console.log('========================================');
};
