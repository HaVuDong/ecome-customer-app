// Export all services
export { default as apiClient } from './api';
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as wishlistService } from './wishlistService';
export { default as categoryService } from './categoryService';
export { default as reviewService } from './reviewService';
export { default as recommendationService } from './recommendationService';

// Export types
export type { ProductResponse, PageResponse, ApiResponse } from './productService';
export type { CartItemResponse, CartResponse, CartGroupedResponse, CheckoutRequest } from './cartService';
export type { OrderResponse, OrderItemResponse } from './orderService';
export type { WishlistItem, WishlistResponse } from './wishlistService';
export type { CategoryResponse } from './categoryService';
export type { ReviewResponse, ReviewRequest } from './reviewService';
