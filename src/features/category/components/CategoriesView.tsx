import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { ProductCard } from '../../product/components/ProductCard';

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

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onProductClick: (product: Product) => void;
}

const { width } = Dimensions.get('window');

export function CategoriesView({
  categories,
  products,
  onProductClick,
}: CategoriesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  return (
    <View style={styles.container}>
      {/* Left Category List */}
      <View style={styles.categoryListContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Right Product List */}
      <View style={styles.productListContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productScrollContent}
        >
          {/* Category Title */}
          <Text style={styles.categoryTitle}>{selectedCategory}</Text>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <ProductCard
                    product={product}
                    onPress={() => onProductClick(product)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có sản phẩm trong danh mục này
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: 64,
  },
  categoryListContainer: {
    width: 96,
    backgroundColor: '#F3F4F6',
  },
  categoryScrollContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#fff',
    borderLeftColor: '#F97316',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  productListContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productScrollContent: {
    padding: 8,
    paddingBottom: 80,
  },
  categoryTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productCardWrapper: {
    width: (width - 96 - 24) / 2,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
