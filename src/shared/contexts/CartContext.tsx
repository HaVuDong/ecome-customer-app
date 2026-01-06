import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import cartService, { CartItemResponse, CartGroupedResponse } from '../../core/services/cartService';
import { useAuth } from './AuthContext';

interface CartItem {
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
  selected: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  groupedCart: CartGroupedResponse | null;
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
  selectedTotal: number;
  loadCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  toggleItemSelection: (itemId: number) => Promise<void>;
  toggleSelectAll: () => void;
  clearCart: () => Promise<void>;
  checkout: (shippingInfo: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    note?: string;
  }) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [groupedCart, setGroupedCart] = useState<CartGroupedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
      setGroupedCart(null);
    }
  }, [isAuthenticated]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data) {
        // Map API response to CartItem format
        const items: CartItem[] = response.data.map((item: CartItemResponse) => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            originalPrice: item.product.originalPrice,
            mainImage: item.product.mainImage,
            stock: item.product.stock,
            seller: item.product.seller,
          },
          quantity: item.quantity,
          selected: true, // Default selected
        }));
        setCartItems(items);
      }
      
      // Also load grouped cart
      const groupedResponse = await cartService.getCartGroupedBySeller();
      if (groupedResponse.success) {
        setGroupedCart(groupedResponse.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      console.warn('User not authenticated. Please login to add items to cart.');
      return false;
    }
    
    try {
      console.log('Adding to cart:', { productId, quantity });
      const response = await cartService.addToCart(productId, quantity);
      console.log('Add to cart response:', response);
      if (response.success) {
        await loadCart();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return false;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await cartService.updateCartItem(itemId, quantity);
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await cartService.removeCartItem(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const toggleItemSelection = async (itemId: number) => {
    try {
      await cartService.toggleSelected(itemId);
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, selected: !item.selected } : item
        )
      );
    } catch (error) {
      console.error('Error toggling selection:', error);
      // Still update locally
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, selected: !item.selected } : item
        )
      );
    }
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(prev =>
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      setGroupedCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const checkout = async (shippingInfo: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    note?: string;
  }) => {
    try {
      const response = await cartService.checkout(shippingInfo);
      if (response.success) {
        await loadCart(); // Reload cart after checkout
        return response.data;
      }
      throw new Error(response.message || 'Checkout failed');
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const selectedTotal = cartItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        groupedCart,
        isLoading,
        totalItems,
        totalAmount,
        selectedTotal,
        loadCart,
        addToCart,
        updateQuantity,
        removeItem,
        toggleItemSelection,
        toggleSelectAll,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
