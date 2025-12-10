import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryName: string) => void;
}

const iconMap: Record<string, any> = {
  Shirt: 'shirt-outline',
  Smartphone: 'phone-portrait-outline',
  Footprints: 'footsteps-outline',
  Sparkles: 'sparkles-outline',
  Watch: 'watch-outline',
  ShoppingBag: 'bag-handle-outline',
  Headphones: 'headset-outline',
  Laptop: 'laptop-outline',
};

export function CategoryGrid({ categories, onCategoryClick }: CategoryGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((category) => {
          const iconName = iconMap[category.icon] || 'apps-outline';
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onCategoryClick(category.name)}
              style={styles.category}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={28} color="#f97316" />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  category: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#374151',
  },
});
