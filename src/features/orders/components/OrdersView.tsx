import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import orderService, {
  OrderResponse,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '../../../core/services/orderService';

interface OrdersViewProps {
  onOrderPress?: (orderId: number) => void;
}

type TabType = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

export function OrdersView({ onOrderPress }: OrdersViewProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getMyOrders(0, 50);
      if (response.data) {
        setOrders(response.data.content);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const filterOrders = useCallback((tab: TabType): OrderResponse[] => {
    if (tab === 'all') return orders;
    const statusMap: Record<TabType, string[]> = {
      all: [],
      pending: ['PENDING'],
      processing: ['PROCESSING'],
      shipped: ['SHIPPED', 'IN_TRANSIT'],
      delivered: ['DELIVERED'],
    };
    return orders.filter(order => 
      statusMap[tab].includes(order.shippingStatus)
    );
  }, [orders]);

  const getTabCount = useCallback((tab: TabType): number => {
    return filterOrders(tab).length;
  }, [filterOrders]);

  const filteredOrders = filterOrders(activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipped', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <Text style={styles.headerSubtitle}>{orders.length} đơn hàng</Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label} ({getTabCount(tab.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#F97316']}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all' 
                ? 'Hãy mua sắm để có đơn hàng đầu tiên!'
                : 'Không có đơn hàng nào trong trạng thái này'}
            </Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => onOrderPress?.(order.id)}
              activeOpacity={0.7}
            >
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderId}>#{order.orderCode || order.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: (SHIPPING_STATUS_COLORS[order.shippingStatus] || '#6B7280') + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText,
                      { color: SHIPPING_STATUS_COLORS[order.shippingStatus] || '#6B7280' }
                    ]}
                  >
                    {SHIPPING_STATUS_LABELS[order.shippingStatus] || order.shippingStatus}
                  </Text>
                </View>
              </View>

              {/* Seller Info */}
              {order.seller && (
                <View style={styles.sellerInfo}>
                  <Ionicons name="storefront-outline" size={14} color="#6B7280" />
                  <Text style={styles.sellerName}>{order.seller.fullName}</Text>
                </View>
              )}

              {/* Order Items Preview */}
              <View style={styles.orderItems}>
                {order.orderItems?.slice(0, 2).map((item, index) => (
                  <View key={item.id || index} style={styles.orderItem}>
                    {item.product?.mainImage && (
                      <Image 
                        source={{ uri: item.product.mainImage }} 
                        style={styles.itemImage}
                      />
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.product?.name || 'Sản phẩm'}
                      </Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {orderService.formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
                {order.orderItems && order.orderItems.length > 2 && (
                  <Text style={styles.moreItems}>
                    +{order.orderItems.length - 2} sản phẩm khác
                  </Text>
                )}
              </View>

              {/* Order Footer */}
              <View style={styles.orderFooter}>
                <View style={styles.paymentInfo}>
                  <Ionicons 
                    name={order.paymentStatus === 'PAID' ? 'checkmark-circle' : 'time-outline'} 
                    size={14} 
                    color={order.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B'} 
                  />
                  <Text style={styles.paymentText}>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalAmount}>
                    {orderService.formatPrice(order.finalAmount || order.totalAmount)}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.orderActions}>
                {order.shippingStatus === 'PENDING' && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      // Handle cancel
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                  </TouchableOpacity>
                )}
                {order.shippingStatus === 'DELIVERED' && (
                  <TouchableOpacity style={styles.reviewButton}>
                    <Ionicons name="star-outline" size={16} color="#F97316" />
                    <Text style={styles.reviewButtonText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.viewDetailButton}
                  onPress={() => onOrderPress?.(order.id)}
                >
                  <Text style={styles.viewDetailText}>Chi tiết</Text>
                  <Ionicons name="chevron-forward" size={16} color="#F97316" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#FFF7ED',
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  sellerName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  orderItems: {
    padding: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  moreItems: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F97316',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F97316',
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    gap: 4,
  },
  viewDetailText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
  },
});
