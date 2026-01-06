import apiClient from './api';

export interface OrderItemResponse {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    mainImage?: string;
  };
}

export interface OrderResponse {
  id: number;
  orderCode?: string;
  userId: number;
  totalAmount: number;
  finalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingName: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: number;
    fullName: string;
  };
  orderItems?: OrderItemResponse[];
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

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
};

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPED: 'Đã giao cho vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
};

export const SHIPPING_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  IN_TRANSIT: '#6366f1',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  RETURNED: '#6b7280',
};

class OrderService {
  // Lấy đơn hàng của user hiện tại
  async getMyOrders(page = 0, size = 20): Promise<ApiResponse<PageResponse<OrderResponse>>> {
    const response = await apiClient.get('/orders/my-orders', {
      params: { page, size },
    });
    return response.data;
  }

  // Lấy chi tiết đơn hàng
  async getOrderById(orderId: number): Promise<ApiResponse<OrderResponse>> {
    const response = await apiClient.get(`/orders/${orderId}/details`);
    return response.data;
  }

  // Lấy đơn hàng theo mã
  async getOrderByCode(orderCode: string): Promise<OrderResponse> {
    const response = await apiClient.get(`/orders/code/${orderCode}`);
    return response.data;
  }

  // Hủy đơn hàng (chỉ khi còn PENDING)
  async cancelOrder(orderId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
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

  // Lấy label trạng thái
  getShippingStatusLabel(status: string): string {
    return SHIPPING_STATUS_LABELS[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
    return PAYMENT_STATUS_LABELS[status] || status;
  }

  getShippingStatusColor(status: string): string {
    return SHIPPING_STATUS_COLORS[status] || '#6b7280';
  }
}

export default new OrderService();
