/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-duplicates */
import React from 'react';
import { View, ScrollView, StyleSheet, Text, StatusBar, SafeAreaView } from 'react-native';
import { Product } from '@/src/shared/types';
import { products, categories, banners, vouchers, flashSaleProducts, liveStreams } from '@/src/core/data/mockData';
import { EnhancedHeader, BottomNav } from '@/src/shared/components/layout';
import { Banner, FlashSale, VoucherSection, LiveSection, DailyCheckin } from '@/src/features/home';
import { ProductGrid, ProductDetail } from '@/src/features/product';
import { CategoryGrid, CategoriesView } from '@/src/features/category';
import { SearchModal } from '@/src/features/search';
import { CartView } from '@/src/features/cart';
import { ProfileView } from '@/src/features/profile';
import { AppProvider, useApp } from '@/src/shared/contexts';
import { CartProvider, useCart } from '@/src/shared/contexts';

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

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setActiveTab('categories');
  };

  const handleProductClick = (productOrId: Product | string) => {
    const product = typeof productOrId === 'string' 
      ? products.find(p => p.id === productOrId)
      : productOrId;
    
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleToggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    cartItems.forEach((item) => {
      if (item.selected !== !allSelected) {
        toggleItemSelection(item.product.id);
      }
    });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  const updatedVouchers = vouchers.map(v => ({
    ...v,
    claimed: claimedVouchers.includes(v.id) || v.claimed
  }));

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
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              <Banner banners={banners} />
              <CategoryGrid
                categories={categories}
                onCategoryClick={handleCategoryClick}
              />
              <FlashSale 
                flashSaleProducts={flashSaleProducts}
                onProductClick={handleProductClick}
              />
              <VoucherSection 
                vouchers={updatedVouchers}
                onClaimVoucher={claimVoucher}
              />
              <LiveSection liveStreams={liveStreams} />
              <DailyCheckin />
              <ProductGrid
                products={products}
                onProductClick={handleProductClick}
                title="GỢI Ý HÔM NAY"
              />
            </ScrollView>
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
            />
          </>
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}

        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
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
      <CartProvider>
        <AppContent />
      </CartProvider>
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
});