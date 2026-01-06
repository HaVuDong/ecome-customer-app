import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal,
  TouchableOpacity, 
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../../product/components/ProductCard';
import recommendationService from '../../../core/services/recommendationService';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  category: string;
  description: string;
  stock: number;
}

interface SearchModalProps {
  products: Product[];
  onClose: () => void;
  onProductClick: (product: Product) => void;
}

const { width } = Dimensions.get('window');

export function SearchModal({ products, onClose, onProductClick }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track search when user types
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        trackSearch(searchQuery);
      }, 1000); // Debounce 1 second
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);
  
  const trackSearch = async (query: string) => {
    try {
      await recommendationService.trackBehavior('SEARCH', {
        searchQuery: query,
        deviceType: 'mobile'
      });
    } catch (error) {
      console.log('Track search failed:', error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentSearches = ['Áo thun', 'Giày sneaker', 'Tai nghe', 'Laptop'];

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F97316" barStyle="light-content" />
        
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header with Search Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#F97316" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {searchQuery === '' ? (
              // Recent Searches
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Tìm kiếm gần đây</Text>
                <View style={styles.recentContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentChip}
                      onPress={() => setSearchQuery(search)}
                    >
                      <Text style={styles.recentText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              // Search Results
              <View style={styles.resultsSection}>
                {filteredProducts.length > 0 ? (
                  <View style={styles.productGrid}>
                    {filteredProducts.map((product, index) => (
                      <View key={`search-${product.id}-${index}`} style={styles.productCardWrapper}>
                        <ProductCard
                          product={product}
                          onPress={() => {
                            onProductClick(product);
                            onClose();
                          }}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                    <Text style={styles.emptySubText}>
                      Hãy thử tìm kiếm với từ khóa khác
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  content: {
    flex: 1,
  },
  recentSection: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  recentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recentText: {
    fontSize: 14,
    color: '#374151',
  },
  resultsSection: {
    padding: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productCardWrapper: {
    width: (width - 24) / 2,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
