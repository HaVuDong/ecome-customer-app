import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Product } from '../../../shared/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  title?: string;
}

export function ProductGrid({ products, onProductClick, title }: ProductGridProps) {
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <FlatList
        data={products}
        renderItem={({ item, index }) => (
          <View style={styles.itemWrapper}>
            <ProductCard product={item} onPress={onProductClick} />
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  itemWrapper: {
    width: '48%',
    marginBottom: 8,
  },
});
