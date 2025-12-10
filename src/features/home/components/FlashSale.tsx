import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FlashSaleProduct {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    discount?: number;
  };
  flashPrice: number;
  stockLimit: number;
  sold: number;
  endTime: Date;
}

interface FlashSaleProps {
  flashSaleProducts: FlashSaleProduct[];
  onProductClick: (productId: string) => void;
}

export function FlashSale({ flashSaleProducts, onProductClick }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const endTime = flashSaleProducts[0]?.endTime;
      if (endTime) {
        const now = new Date().getTime();
        const distance = new Date(endTime).getTime() - now;
        if (distance > 0) {
          setTimeLeft({
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSaleProducts]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flash" size={24} color="#fbbf24" />
          <Text style={styles.title}>FLASH SALE</Text>
        </View>
        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Text style={styles.timerNumber}>{formatNumber(timeLeft.hours)}</Text>
          </View>
          <Text style={styles.timerSeparator}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerNumber}>{formatNumber(timeLeft.minutes)}</Text>
          </View>
          <Text style={styles.timerSeparator}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerNumber}>{formatNumber(timeLeft.seconds)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {flashSaleProducts.map((item) => {
          const percentSold = (item.sold / item.stockLimit) * 100;
          return (
            <TouchableOpacity
              key={item.product.id}
              onPress={() => onProductClick(item.product.id)}
              style={styles.productCard}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.product.image }} style={styles.productImage} resizeMode="cover" />
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{item.product.discount}%</Text>
                </View>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.price}>₫{item.flashPrice.toLocaleString()}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentSold}%` }]} />
                    <Text style={styles.progressText}>Đã bán {item.sold}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  timerNumber: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerSeparator: {
    color: '#ffffff',
    fontSize: 14,
    marginHorizontal: 2,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  productCard: {
    width: 144,
    marginRight: 12,
  },
  imageContainer: {
    width: '100%',
    height: 144,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountText: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productInfo: {
    marginTop: 8,
  },
  price: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#f97316',
  },
  progressText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '600',
    zIndex: 1,
  },
  soldText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
});
