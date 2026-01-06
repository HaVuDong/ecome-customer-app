import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: number;
  name: string;
  price: number;
  mainImage?: string;
  image?: string;
  stock: number;
  seller?: {
    id: number;
    fullName: string;
  };
}

interface CartItem {
  id: number; // Cart item ID
  product: Product;
  quantity: number;
  selected: boolean;
}

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onToggleSelect: (itemId: number) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
}

export function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
}: CartViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubText}>
            Hãy thêm sản phẩm vào giỏ hàng nhé!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Select All Header */}
      <View style={styles.selectAllHeader}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={onToggleSelectAll}
        >
          <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
            {allSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>
            Chọn tất cả ({cartItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemContent}>
              {/* Checkbox */}
              <TouchableOpacity 
                style={styles.itemCheckboxContainer}
                onPress={() => onToggleSelect(item.id)}
              >
                <View style={[styles.checkbox, item.selected && styles.checkboxChecked]}>
                  {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              {/* Product Image */}
              <Image
                source={{ uri: item.product.mainImage || item.product.image || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
              />

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.productPrice}>
                  {formatPrice(item.product.price)}
                </Text>

                {/* Quantity Controls & Delete */}
                <View style={styles.actionsRow}>
                  {/* Quantity Controls */}
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        item.quantity <= 1 && styles.quantityButtonDisabled
                      ]}
                      onPress={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons 
                        name="remove" 
                        size={16} 
                        color={item.quantity <= 1 ? '#D1D5DB' : '#374151'} 
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        item.quantity >= item.product.stock && styles.quantityButtonDisabled
                      ]}
                      onPress={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Ionicons 
                        name="add" 
                        size={16} 
                        color={item.quantity >= item.product.stock ? '#D1D5DB' : '#374151'} 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onRemoveItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutTop}>
          {/* Select All */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={onToggleSelectAll}
          >
            <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
              {allSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.selectAllTextSmall}>
              Tất cả ({selectedItems.length} sản phẩm)
            </Text>
          </TouchableOpacity>

          {/* Total Price */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.length === 0 && styles.checkoutButtonDisabled
          ]}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            Mua hàng ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyContent: {
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
  selectAllHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  selectAllText: {
    fontSize: 14,
    color: '#374151',
  },
  selectAllTextSmall: {
    fontSize: 13,
    color: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  cartItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  itemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  itemCheckboxContainer: {
    marginTop: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
  },
  quantityButton: {
    padding: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    paddingBottom: 80,
  },
  checkoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 20,
    color: '#F97316',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
