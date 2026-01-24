import apiClient from './api';

export interface CartItemResponse {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    mainImage?: string;
    stock: number;
    seller: {
      id: number;
      fullName: string;
    };
  };
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
}

export interface CartGroupedResponse {
  sellerId: number;
  sellerName: string;
  items: CartItemResponse[];
  subtotal: number;
}

export interface CheckoutRequest {
  cartItemIds: number[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  note?: string;
  voucherCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class CartService {
  // Lấy giỏ hàng hiện tại
  async getCart(): Promise<ApiResponse<CartItemResponse[]>> {
    const response = await apiClient.get('/cart');
    return response.data;
  }

  // Lấy giỏ hàng nhóm theo seller
  async getCartGroupedBySeller(): Promise<ApiResponse<CartGroupedResponse>> {
    const response = await apiClient.get('/cart/grouped');
    return response.data;
  }

  // Lấy các items đã chọn
  async getSelectedItems(): Promise<ApiResponse<CartItemResponse[]>> {
    const response = await apiClient.get('/cart/selected');
    return response.data;
  }

  // Lấy tổng tiền
  async getCartTotal(): Promise<ApiResponse<{ total: number }>> {
    const response = await apiClient.get('/cart/total');
    return response.data;
  }

  // Thêm sản phẩm vào giỏ
  async addToCart(productId: number, quantity: number = 1): Promise<ApiResponse<CartItemResponse>> {
    const response = await apiClient.post('/cart/add', null, {
      params: { productId, quantity },
    });
    return response.data;
  }

  // Cập nhật số lượng
  async updateCartItem(itemId: number, quantity: number): Promise<ApiResponse<CartItemResponse>> {
    const response = await apiClient.put(`/cart/${itemId}`, null, {
      params: { quantity },
    });
    return response.data;
  }

  // Toggle chọn/bỏ chọn item
  async toggleSelected(itemId: number): Promise<ApiResponse<CartItemResponse>> {
    const response = await apiClient.put(`/cart/${itemId}/toggle`);
    return response.data;
  }

  // Chọn/bỏ chọn tất cả items của 1 seller
  async selectAllBySeller(sellerId: number, selected: boolean): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/cart/seller/${sellerId}/select`, null, {
      params: { selected },
    });
    return response.data;
  }

  // Xóa item khỏi giỏ
  async removeCartItem(itemId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/cart/${itemId}`);
    return response.data;
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  }

  // Checkout - tạo đơn hàng từ giỏ
  async checkout(request: CheckoutRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/cart/checkout', request);
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
}

export default new CartService();
