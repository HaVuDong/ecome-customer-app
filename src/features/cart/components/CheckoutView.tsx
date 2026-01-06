import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../../shared/contexts/CartContext';
import { useAuth } from '../../../shared/contexts/AuthContext';
import QrPaymentScreen from '../../orders/components/QrPaymentScreen';

interface CheckoutViewProps {
  onBack?: () => void;
  onSuccess?: (orders: any[]) => void;
}

export function CheckoutView({ onBack, onSuccess }: CheckoutViewProps) {
  const { user } = useAuth();
  const { cartItems, selectedTotal, checkout, isLoading } = useCart();
  
  const [shippingName, setShippingName] = useState(user?.fullName || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // QR Payment states
  const [showQrPayment, setShowQrPayment] = useState(false);
  const [qrOrderId, setQrOrderId] = useState<number | null>(null);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);

  const selectedItems = cartItems.filter(item => item.selected);
  const shippingFee = selectedTotal >= 500000 ? 0 : 30000; // Free ship for orders >= 500k
  const finalTotal = selectedTotal + shippingFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = (): boolean => {
    if (!shippingName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
      return false;
    }
    if (!shippingPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(shippingPhone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }
    if (!shippingAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
      return false;
    }
    if (selectedItems.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm để đặt hàng');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const orders = await checkout({
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        note: note.trim() || undefined,
      });

      // Nếu chọn QR_TRANSFER → chuyển sang màn hình QR
      if (paymentMethod === 'QR_TRANSFER') {
        setCreatedOrders(orders);
        // Nếu có nhiều đơn hàng (nhiều seller), lấy đơn đầu tiên để thanh toán
        const firstOrder = Array.isArray(orders) ? orders[0] : orders;
        setQrOrderId(firstOrder.id);
        setShowQrPayment(true);
      } else {
        // COD - Hiển thị thông báo thành công
        Alert.alert(
          'Đặt hàng thành công!',
          `Đã tạo ${Array.isArray(orders) ? orders.length : 1} đơn hàng`,
          [
            {
              text: 'OK',
              onPress: () => onSuccess?.(orders),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Đặt hàng thất bại',
        error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý khi thanh toán QR thành công
  const handleQrPaymentSuccess = () => {
    setShowQrPayment(false);
    setQrOrderId(null);
    onSuccess?.(createdOrders);
  };

  // Xử lý khi user quay lại từ QR screen
  const handleQrBack = () => {
    setShowQrPayment(false);
    setQrOrderId(null);
    // Không navigate back, giữ nguyên checkout screen
  };

  const paymentMethods = [
    { id: 'COD', label: 'Thanh toán khi nhận hàng', icon: 'cash-outline' },
    { id: 'QR_TRANSFER', label: 'Chuyển khoản QR (MB Bank)', icon: 'qr-code-outline' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  // Hiển thị màn hình QR Payment nếu đang thanh toán QR
  if (showQrPayment && qrOrderId) {
    return (
      <QrPaymentScreen
        orderId={qrOrderId}
        totalAmount={finalTotal}
        onPaymentSuccess={handleQrPaymentSuccess}
        onBack={handleQrBack}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Shipping Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Địa chỉ nhận hàng</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ tên người nhận *</Text>
            <TextInput
              style={styles.input}
              value={shippingName}
              onChangeText={setShippingName}
              placeholder="Nhập họ tên"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              value={shippingPhone}
              onChangeText={setShippingPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Sản phẩm đã chọn ({selectedItems.length})</Text>
          </View>

          {selectedItems.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.orderItem}>
              {item.product.mainImage && (
                <Image
                  source={{ uri: item.product.mainImage }}
                  style={styles.itemImage}
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.price * item.quantity)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {selectedItems.length > 3 && (
            <Text style={styles.moreItems}>
              +{selectedItems.length - 3} sản phẩm khác
            </Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={paymentMethod === method.id ? '#F97316' : '#6B7280'}
              />
              <Text
                style={[
                  styles.paymentLabel,
                  paymentMethod === method.id && styles.paymentLabelSelected,
                ]}
              >
                {method.label}
              </Text>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbox-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Ghi chú</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Tổng thanh toán</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(selectedTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
            </Text>
          </View>
          {shippingFee === 0 && (
            <Text style={styles.freeShipNote}>
              Miễn phí vận chuyển cho đơn hàng từ {formatPrice(500000)}
            </Text>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotal}>{formatPrice(finalTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || selectedItems.length === 0) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitOrder}
          disabled={isSubmitting || selectedItems.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
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
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
  moreItems: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  paymentLabelSelected: {
    color: '#F97316',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#F97316',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  freeShipNote: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F97316',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  submitButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
