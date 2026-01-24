import api from './api';

/**
 * Payment Service - Client service cho thanh toán QR
 * 
 * GIẢI THÍCH KHI BẢO VỆ:
 * 
 * 1. generateQrPayment: Tạo mã QR cho đơn hàng
 * 2. checkPaymentStatus: Kiểm tra trạng thái (polling)
 * 3. cancelQrPayment: Hủy QR và quay về COD
 * 4. getBankInfo: Lấy thông tin bank backup
 */

export interface QrPaymentResponse {
  orderId: number;
  qrCodeUrl: string;
  transactionId: string;
  expiredAt: string;
  expiryMinutes: number;
  amount: number;
  bankId: string;
  bankAccount: string;
  accountName: string;
}

export interface PaymentStatusResponse {
  orderId: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'COD' | 'QR_TRANSFER' | null;
  isQrExpired?: boolean;
  qrExpiredAt?: string;
  paidAt?: string;
  transactionId?: string;
  amount: number;
}

export interface BankInfo {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  note: string;
}

/**
 * Tạo mã QR thanh toán cho đơn hàng
 */
export const generateQrPayment = async (orderId: number): Promise<QrPaymentResponse> => {
  const response = await api.post(`/payments/qr/${orderId}`);
  return response.data;
};

/**
 * Kiểm tra trạng thái thanh toán
 * Frontend gọi polling mỗi 5-10 giây
 */
export const checkPaymentStatus = async (orderId: number): Promise<PaymentStatusResponse> => {
  const response = await api.get(`/payments/qr/${orderId}/status`);
  return response.data;
};

/**
 * Hủy thanh toán QR (quay về COD)
 */
export const cancelQrPayment = async (orderId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/payments/qr/${orderId}/cancel`);
  return response.data;
};

/**
 * Xác nhận thanh toán (chỉ dùng cho demo/testing)
 */
export const confirmPayment = async (orderId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/payments/qr/${orderId}/confirm`);
  return response.data;
};

/**
 * VNPay create payment (returns payment_url)
 */
export const createVnPayPayment = async (orderId: number): Promise<{ payment_url: string }> => {
  // NOTE: backend endpoint is /api/payment/vnpay/create (VnPayController)
  const response = await api.post('payment/vnpay/create', { orderId });
  const payload = (response?.data?.data ?? response?.data) as { payment_url: string } | undefined;
  if (!payload || !payload.payment_url) {
    throw new Error(`Invalid response from VNPay create: ${JSON.stringify(response?.data)}`);
  }
  return payload;
};

/**
 * Lấy thông tin ngân hàng
 */
export const getBankInfo = async (): Promise<BankInfo> => {
  const response = await api.get('/payments/bank-info');
  return response.data;
};

export default {
  generateQrPayment,
  checkPaymentStatus,
  cancelQrPayment,
  confirmPayment,
  createVnPayPayment,
  getBankInfo,
};
