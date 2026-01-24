/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-duplicates */
import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, StatusBar, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '@/src/shared/types';
import { EnhancedHeader, BottomNav } from '@/src/shared/components/layout';
import { Banner, FlashSale, VoucherSection, LiveSection, DailyCheckin } from '@/src/features/home';
import { AiChatView } from '@/src/features/aiChat/components/AiChatView';


import { ProductGrid, ProductDetail } from '@/src/features/product';
import { CategoryGrid, CategoriesView } from '@/src/features/category';
import { SearchModal } from '@/src/features/search';
import { CartView, CheckoutView } from '@/src/features/cart';
import { ProfileView } from '@/src/features/profile';
import { AppProvider, useApp } from '@/src/shared/contexts';
import { useCart } from '@/src/shared/contexts';
import productService, { ProductResponse } from '@/src/core/services/productService';
import categoryService, { CategoryResponse } from '@/src/core/services/categoryService';
import { RecommendationSection } from '@/src/features/home';
import { ChatView } from '@/src/features/chat/components/ChatView';

// Placeholder empty data (mockData removed per request)
const banners: any[] = [];
const vouchers: any[] = [];
const flashSaleProducts: any[] = [];
const liveStreams: any[] = [];

// Chuyển đổi từ API response sang Product type
const mapApiProductToProduct = (apiProduct: ProductResponse): Product => ({
  id: apiProduct.id.toString(),
  name: apiProduct.name,
  price: apiProduct.price,
  originalPrice: apiProduct.originalPrice,
  image: apiProduct.mainImage || 'https://via.placeholder.com/200',
  rating: apiProduct.rating || 0,
  sold: apiProduct.soldCount,
  discount: apiProduct.originalPrice 
    ? Math.round(((apiProduct.originalPrice - apiProduct.price) / apiProduct.originalPrice) * 100)
    : undefined,
  category: apiProduct.category?.name || 'Khác',
  description: apiProduct.description || '',
  stock: apiProduct.stock,
  images: apiProduct.mainImage ? [apiProduct.mainImage] : [],
  shop: {
    name: apiProduct.seller?.fullName || 'Shop',
    rating: 4.5,
    products: 100,
    responseRate: 95,
    responseTime: '1 giờ',
    followers: 1000,
  },
  seller: apiProduct.seller ? {
    id: apiProduct.seller.id,
    username: apiProduct.seller.username,
    fullName: apiProduct.seller.fullName,
    avatar: apiProduct.seller.avatarUrl || apiProduct.seller.avatar,
  } : undefined,
});

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedProduct, 
    setSelectedProduct,
    showSearch,
    setShowSearch,
    selectedCategory,
    setSelectedCategory,
    claimedVouchers,
    claimVoucher
  } = useApp();
  
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    toggleItemSelection
  } = useCart();

  // State cho API data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useRealApi, setUseRealApi] = useState(true);
  
  // State cho Chat
  const [showChat, setShowChat] = useState(false);
  const [chatSellerId, setChatSellerId] = useState<number>(0);
  const [chatSellerName, setChatSellerName] = useState<string>('');
  const [chatProductInfo, setChatProductInfo] = useState<{
    productId: number;
    productName: string;
    productImage: string;
    productPrice: number;
  } | null>(null);

  // State cho Checkout
  const [showCheckout, setShowCheckout] = useState(false);

  // Load data từ API
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    try {
      // Load products
      const [productsRes, categoriesRes, topRes, newestRes] = await Promise.allSettled([
        productService.getAllProducts(0, 20),
        categoryService.getAllCategories(),
        productService.getTopSellingProducts(),
        productService.getNewestProducts(),
      ]);

      if (productsRes.status === 'fulfilled' && productsRes.value.content?.length > 0) {
        setProducts(productsRes.value.content.map(mapApiProductToProduct));
        setUseRealApi(true);
      } else {
        // No products returned from API and no local mock data; show empty state
        setProducts([]);
        setUseRealApi(false);
      }

      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.length > 0) {
        const mappedCategories = categoriesRes.value.map((cat: CategoryResponse) => ({
          id: cat.id.toString(),
          name: cat.name,
          icon: categoryService.getCategoryIcon(cat.icon),
        }));
        setCategories(mappedCategories);
      }

      if (topRes.status === 'fulfilled' && topRes.value?.length > 0) {
        setTopProducts(topRes.value.map(mapApiProductToProduct));
      }

      if (newestRes.status === 'fulfilled' && newestRes.value?.length > 0) {
        setNewestProducts(newestRes.value.map(mapApiProductToProduct));
      }
    } catch (error) {
      console.log('API error, showing offline view:', error);
      setProducts([]);
      setCategories([]);
      setUseRealApi(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setActiveTab('categories');
  };

  const handleProductClick = async (productOrId: Product | string) => {
    let product: Product | undefined;
    
    if (typeof productOrId === 'string') {
      // Thử lấy từ API trước
      if (useRealApi) {
        try {
          const apiProduct = await productService.getProductById(parseInt(productOrId));
          product = mapApiProductToProduct(apiProduct);
        } catch {
          product = products.find(p => p.id === productOrId);
        }
      } else {
        product = products.find(p => p.id === productOrId);
      }
    } else {
      product = productOrId;
    }
    
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleToggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    cartItems.forEach((item) => {
      if (item.selected !== !allSelected) {
        toggleItemSelection(item.id);
      }
    });
  };

  // Wrapper function để add to cart từ ProductDetail
  const handleAddToCart = async (product: Product, quantity: number) => {
    const productId = parseInt(product.id);
    if (isNaN(productId)) {
      console.error('Invalid product ID:', product.id);
      return;
    }
    await addToCart(productId, quantity);
  };

  // Handler để mở chat với seller
  const handleOpenChat = (
    sellerId: number, 
    sellerName: string, 
    productInfo: { productId: number; productName: string; productImage: string; productPrice: number; }
  ) => {
    setChatSellerId(sellerId);
    setChatSellerName(sellerName);
    setChatProductInfo(productInfo);
    setShowChat(true);
  };

  // Handler để đóng chat
  const handleCloseChat = () => {
    setShowChat(false);
    setChatSellerId(0);
    setChatSellerName('');
    setChatProductInfo(null);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  const updatedVouchers = vouchers.map(v => ({
    ...v,
    claimed: claimedVouchers.includes(v.id) || v.claimed
  }));

  // Flash sale products từ API hoặc mock
  const displayFlashSale = topProducts.length > 0 
    ? topProducts.slice(0, 6).map((p, index) => ({
        product: {
          id: `${p.id}-flash-${index}`,
          name: p.name,
          price: p.price,
          image: p.image,
          discount: p.discount || 0,
        },
        flashPrice: p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price,
        stockLimit: p.stock || 100,
        sold: p.sold || 0,
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 giờ từ bây giờ
      }))
    : flashSaleProducts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />
      <View style={styles.content}>
        {activeTab === 'home' && (
          <>
            <EnhancedHeader
              cartCount={totalCartCount}
              notificationCount={3}
              onSearchClick={() => setShowSearch(true)}
              onCartClick={() => setActiveTab('cart')}
              onQRClick={() => {}}
              onAiClick={() => setActiveTab('ai')}
            />
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#f97316']}
                    tintColor="#f97316"
                  />
                }
              >
                {!useRealApi && (
                  <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>📡 Đang dùng dữ liệu mẫu - Kéo xuống để thử kết nối lại</Text>
                  </View>
                )}
                <Banner banners={banners} />
                <CategoryGrid
                  categories={categories}
                  onCategoryClick={handleCategoryClick}
                />
                <FlashSale 
                  flashSaleProducts={displayFlashSale}
                  onProductClick={handleProductClick}
                />
                <VoucherSection 
                  vouchers={updatedVouchers}
                  onClaimVoucher={claimVoucher}
                />
                <LiveSection liveStreams={liveStreams} />
                <DailyCheckin />
                
                {/* AI Recommendation Section */}
                <RecommendationSection 
                  onProductClick={handleProductClick}
                />
                
                {newestProducts.length > 0 && (
                  <ProductGrid
                    products={newestProducts}
                    onProductClick={handleProductClick}
                    title="SẢN PHẨM MỚI"
                  />
                )}
                <ProductGrid
                  products={products}
                  onProductClick={handleProductClick}
                  title="GỢI Ý HÔM NAY"
                />
              </ScrollView>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <EnhancedHeader
              cartCount={totalCartCount}
              notificationCount={3}
              onSearchClick={() => setShowSearch(true)}
              onCartClick={() => setActiveTab('cart')}
              onQRClick={() => {}}
              onAiClick={() => setActiveTab('ai')}
            />
            <CategoriesView
              categories={categories}
              products={products}
              onProductClick={handleProductClick}
            />
          </>
        )}

        {activeTab === 'cart' && (
          <>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Giỏ Hàng</Text>
            </View>
            <CartView
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onToggleSelect={toggleItemSelection}
              onToggleSelectAll={handleToggleSelectAll}
              allSelected={allSelected}
              onCheckout={() => setShowCheckout(true)}
            />
          </>
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}

        {activeTab === 'ai' && (
          <>
            <EnhancedHeader
              cartCount={totalCartCount}
              notificationCount={3}
              onSearchClick={() => setShowSearch(true)}
              onCartClick={() => setActiveTab('cart')}
              onQRClick={() => {}}
              onAiClick={() => setActiveTab('ai')}
            />
            <AiChatView
              onAddToCart={(product) => handleAddToCart(product, 1)}
              onBuyNow={(product) => {
                handleAddToCart(product, 1);
                setShowCheckout(true);
                setSelectedProduct(product);
                setActiveTab('cart');
              }}
            />
          </>
        )}

        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onChat={handleOpenChat}
          />
        )}

        {/* Chat Modal */}
        {showChat && (
          <Modal
            visible={showChat}
            animationType="slide"
            onRequestClose={handleCloseChat}
          >
            <ChatView
              sellerId={chatSellerId}
              sellerName={chatSellerName}
              productId={chatProductInfo?.productId}
              productName={chatProductInfo?.productName}
              productImage={chatProductInfo?.productImage}
              productPrice={chatProductInfo?.productPrice}
              onClose={handleCloseChat}
            />
          </Modal>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <Modal
            visible={showCheckout}
            animationType="slide"
            onRequestClose={() => setShowCheckout(false)}
          >
            <CheckoutView
              onBack={() => setShowCheckout(false)}
              onSuccess={(orders) => {
                setShowCheckout(false);
                setActiveTab('home');
              }}
            />
          </Modal>
        )}

        {showSearch && (
          <SearchModal
            products={products}
            onClose={() => setShowSearch(false)}
            onProductClick={handleProductClick}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={totalCartCount}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  cartHeader: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
});