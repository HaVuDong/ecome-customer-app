import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import orderService, {
  OrderResponse,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '../../../core/services/orderService';

interface OrderDetailViewProps {
  orderId: number;
  onBack?: () => void;
  onReviewProduct?: (productId: number, orderId: number) => void;
}

export function OrderDetailView({ orderId, onBack, onReviewProduct }: OrderDetailViewProps) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await orderService.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
              loadOrderDetail();
            } catch (error: any) {
              Alert.alert(
                'Lỗi', 
                error.response?.data?.message || 'Không thể hủy đơn hàng'
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  const shippingColor = SHIPPING_STATUS_COLORS[order.shippingStatus] || '#6B7280';
  const totalItems = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const canCancel = order.shippingStatus === 'PENDING';
  const canReview = order.shippingStatus === 'DELIVERED';

  // Tạo timeline trạng thái
  const statusTimeline = [
    { status: 'PENDING', label: 'Đặt hàng', icon: 'cart-outline' },
    { status: 'PROCESSING', label: 'Xác nhận', icon: 'checkmark-circle-outline' },
    { status: 'SHIPPED', label: 'Đã giao', icon: 'cube-outline' },
    { status: 'IN_TRANSIT', label: 'Vận chuyển', icon: 'car-outline' },
    { status: 'DELIVERED', label: 'Hoàn thành', icon: 'home-outline' },
  ];

  const currentStatusIndex = statusTimeline.findIndex(s => s.status === order.shippingStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderId}>#{order.orderCode || order.id}</Text>
        </View>
        <View 
          style={[styles.statusBadge, { backgroundColor: shippingColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: shippingColor }]}>
            {SHIPPING_STATUS_LABELS[order.shippingStatus] || order.shippingStatus}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        {order.shippingStatus !== 'CANCELLED' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
            <View style={styles.timeline}>
              {statusTimeline.map((item, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <View key={item.status} style={styles.timelineItem}>
                    <View style={styles.timelineIconWrapper}>
                      <View 
                        style={[
                          styles.timelineIcon,
                          isActive && styles.timelineIconActive,
                          isCurrent && styles.timelineIconCurrent,
                        ]}
                      >
                        <Ionicons 
                          name={item.icon as any}
                          size={16} 
                          color={isActive ? '#FFFFFF' : '#9CA3AF'} 
                        />
                      </View>
                      {index < statusTimeline.length - 1 && (
                        <View 
                          style={[
                            styles.timelineLine,
                            isActive && styles.timelineLineActive,
                          ]} 
                        />
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.timelineLabel,
                        isActive && styles.timelineLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Shipping Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <View style={styles.shippingInfo}>
            <Text style={styles.shippingName}>{order.shippingName}</Text>
            <Text style={styles.shippingPhone}>{order.shippingPhone}</Text>
            <Text style={styles.shippingAddress}>{order.shippingAddress}</Text>
          </View>
        </View>

        {/* Seller Info */}
        {order.seller && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="storefront-outline" size={20} color="#F97316" />
              <Text style={styles.cardTitle}>Thông tin người bán</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{order.seller.fullName}</Text>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Sản phẩm ({totalItems})</Text>
          </View>
          {order.orderItems?.map((item, index) => (
            <View 
              key={item.id || index} 
              style={[
                styles.orderItem,
                index < (order.orderItems?.length || 0) - 1 && styles.orderItemBorder,
              ]}
            >
              {item.product?.mainImage && (
                <Image 
                  source={{ uri: item.product.mainImage }} 
                  style={styles.itemImage}
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name || 'Sản phẩm'}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {orderService.formatPrice(item.price)}
                  </Text>
                </View>
                {canReview && (
                  <TouchableOpacity 
                    style={styles.reviewItemButton}
                    onPress={() => onReviewProduct?.(item.product?.id || item.productId, orderId)}
                  >
                    <Ionicons name="star-outline" size={14} color="#F97316" />
                    <Text style={styles.reviewItemText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Thanh toán</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phương thức</Text>
            <Text style={styles.paymentValue}>{order.paymentMethod || 'COD'}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Trạng thái</Text>
            <Text style={[
              styles.paymentValue,
              { color: order.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B' }
            ]}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tạm tính</Text>
            <Text style={styles.paymentValue}>
              {orderService.formatPrice(order.totalAmount)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phí vận chuyển</Text>
            <Text style={styles.paymentValue}>
              {orderService.formatPrice(order.shippingFee || 0)}
            </Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Giảm giá</Text>
              <Text style={[styles.paymentValue, { color: '#10B981' }]}>
                -{orderService.formatPrice(order.discountAmount)}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {orderService.formatPrice(order.finalAmount || order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>{order.orderCode || order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
          {order.note && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Ghi chú:</Text>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {canCancel && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.cancelOrderButton}
              onPress={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.cancelOrderText}>Hủy đơn hàng</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderId: {
    fontSize: 13,
    color: '#6B7280',
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
  scrollView: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#10B981',
  },
  timelineIconCurrent: {
    backgroundColor: '#F97316',
  },
  timelineLine: {
    position: 'absolute',
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineLineActive: {
    backgroundColor: '#10B981',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#374151',
    fontWeight: '500',
  },
  shippingInfo: {
    gap: 4,
  },
  shippingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  shippingPhone: {
    fontSize: 14,
    color: '#374151',
  },
  shippingAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  sellerInfo: {
    paddingVertical: 4,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  reviewItemText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  noteContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    marginTop: 8,
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelOrderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
