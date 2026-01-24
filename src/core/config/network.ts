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
export const USE_PRODUCTION = false; // true = Render, false = Local
export const FORCE_PRODUCTION = false; // when true, do NOT fallback to local automatically
// ============================================================

// Production URL (Render)
export const PRODUCTION_URL = 'https://backend-ecome-03zq.onrender.com';

// Local development
// For local device testing on Android emulator use 10.0.2.2 (Android emulator -> host localhost)
// Auto-select host based on platform: Android emulator -> 10.0.2.2, others -> localhost.
// Use LAN IP of your computer for physical device testing (set by user)
export const DEFAULT_LOCAL_HOST = '192.168.8.199'; // set from ipconfig (your machine) or use 127.0.0.1 for local emulator
export const LOCAL_IP = DEFAULT_LOCAL_HOST; // change this value if you test with a different machine or network
export const API_PORT = '8080';

// AIbox (local) - used by dev to call the AI service directly
// Default to the same host as LOCAL_IP but port 8081 (Aiboxecome default)
export const AIBOX_BASE = `http://${LOCAL_IP}:8081`;
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
 * TÙY CHỌN MỚI: Ưu tiên local nếu có thể, nếu local không reachable -> thử production
 * Trả về đầy đủ base API (ví dụ https://.../api or http://<ip>:8080/api)
 */
export const resolveApiUrl = async (timeoutMs = 3000): Promise<string> => {
  // Force production override
  if (FORCE_PRODUCTION) {
    console.log('⚡ NETWORK: FORCE_PRODUCTION enabled - using PRODUCTION');
    return `${PRODUCTION_URL}/api`;
  }

  const controllerLocal = new AbortController();
  const timerLocal = setTimeout(() => controllerLocal.abort(), timeoutMs);
  try {
    // Try local first
    const resLocal = await fetch(getHealthCheckUrl(false), { signal: controllerLocal.signal });
    clearTimeout(timerLocal);
    if (resLocal.ok) {
      console.log('⚡ NETWORK: Local backend reachable, using local API');
      return `http://${LOCAL_IP}:${API_PORT}/api`;
    }
  } catch (err) {
    console.log('⚠️ NETWORK: Local backend not reachable (timeout/error), trying production...');
  }

  // Try production as fallback
  const controllerProd = new AbortController();
  const timerProd = setTimeout(() => controllerProd.abort(), timeoutMs);
  try {
    const resProd = await fetch(getHealthCheckUrl(true), { signal: controllerProd.signal });
    clearTimeout(timerProd);
    if (resProd.ok) {
      console.log('⚡ NETWORK: Production backend reachable, using production API');
      return `${PRODUCTION_URL}/api`;
    }
  } catch (err) {
    console.log('⚠️ NETWORK: Production backend not reachable either. Falling back to local URL (best-effort)');
  }

  // If both failed, return local by default (best-effort)
  return `http://${LOCAL_IP}:${API_PORT}/api`;
};

// Log IP khi app khởi động (debug)
export const logNetworkConfig = () => {
  console.log('========================================');
  console.log('📡 NETWORK CONFIG');
  console.log('========================================');
  console.log(`🌐 Mode: ${USE_PRODUCTION ? 'PRODUCTION (Render)' : 'LOCAL (prefer local then fallback to production)'}`);
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
