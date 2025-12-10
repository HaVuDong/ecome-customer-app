import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../../shared/types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const { width } = Dimensions.get('window');

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString()}`;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const images = product.images || [product.image];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={16} color="#fbbf24" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#fbbf24" />);
    }
    return stars;
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageGallery}>
            <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} resizeMode="cover" />
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.favoriteButton}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#ef4444" : "#ffffff"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color="#ffffff" />
            </TouchableOpacity>

            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImage(index)}
                    style={[
                      styles.paginationDot,
                      index === selectedImage && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Price and Title */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
              )}
            </View>
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  Giảm {product.discount}% - Tiết kiệm {formatPrice((product.originalPrice || 0) - product.price)}
                </Text>
              </View>
            )}

            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>{renderStars(product.rating)}</View>
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.soldText}>Đã bán {product.sold.toLocaleString()}</Text>
            </View>
          </View>

          {/* Shipping & Services */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Dịch vụ & Ưu đãi</Text>
            <View style={styles.serviceItem}>
              <Ionicons name="car-outline" size={20} color="#10b981" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Miễn phí vận chuyển</Text>
                <Text style={styles.serviceDesc}>Đơn từ 50K</Text>
              </View>
            </View>
            <View style={styles.serviceItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#3b82f6" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Chính hãng 100%</Text>
                <Text style={styles.serviceDesc}>Đảm bảo hoàn tiền</Text>
              </View>
            </View>
            <View style={styles.serviceItem}>
              <Ionicons name="return-up-back-outline" size={20} color="#f97316" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Đổi trả miễn phí trong 7 ngày</Text>
                <Text style={styles.serviceDesc}>Nếu sản phẩm lỗi</Text>
              </View>
            </View>
          </View>

          {/* Variations */}
          {product.variations && product.variations.length > 0 && (
            <View style={styles.variationsSection}>
              {product.variations.map((variation) => (
                <View key={variation.name} style={styles.variationGroup}>
                  <Text style={styles.variationTitle}>{variation.name}</Text>
                  <View style={styles.variationOptions}>
                    {variation.options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() =>
                          setSelectedVariations({
                            ...selectedVariations,
                            [variation.name]: option,
                          })
                        }
                        style={[
                          styles.variationOption,
                          selectedVariations[variation.name] === option && styles.variationOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.variationOptionText,
                            selectedVariations[variation.name] === option && styles.variationOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Shop Info */}
          {product.shop && (
            <View style={styles.shopSection}>
              <View style={styles.shopHeader}>
                <View style={styles.shopInfo}>
                  <View style={styles.shopAvatar}>
                    <Text style={styles.shopAvatarText}>{product.shop.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <View style={styles.shopNameRow}>
                      <Text style={styles.shopName}>{product.shop.name}</Text>
                      <View style={styles.mallBadge}>
                        <Text style={styles.mallBadgeText}>Mall</Text>
                      </View>
                    </View>
                    <View style={styles.shopRating}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.shopRatingText}>{product.shop.rating}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewShopButton}>
                  <Text style={styles.viewShopButtonText}>Xem Shop</Text>
                  <Ionicons name="chevron-forward" size={16} color="#f97316" />
                </TouchableOpacity>
              </View>
              <View style={styles.shopStats}>
                <View style={styles.shopStat}>
                  <Text style={styles.shopStatLabel}>Sản phẩm</Text>
                  <Text style={styles.shopStatValue}>{product.shop.products}</Text>
                </View>
                <View style={styles.shopStat}>
                  <Text style={styles.shopStatLabel}>Phản hồi</Text>
                  <Text style={styles.shopStatValue}>{product.shop.responseRate}%</Text>
                </View>
                <View style={styles.shopStat}>
                  <Text style={styles.shopStatLabel}>Thời gian</Text>
                  <Text style={styles.shopStatValue}>{product.shop.responseTime}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Specifications */}
          {product.specifications && (
            <View style={styles.specificationsSection}>
              <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <View key={key} style={[styles.specItem, index === Object.entries(product.specifications!).length - 1 && styles.specItemLast]}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                  <Ionicons name="chevron-forward" size={16} color="#f97316" />
                </TouchableOpacity>
              </View>
              {product.reviews.map((review, index) => (
                <View key={review.id} style={[styles.reviewItem, index === product.reviews!.length - 1 && styles.reviewItemLast]}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>{review.userName.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.userName}</Text>
                      <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarRow}>
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#f97316" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
            <View style={styles.bottomDivider} />
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>SL:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                >
                  <Ionicons name="remove" size={14} color={quantity <= 1 ? "#d1d5db" : "#374151"} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  onPress={increaseQuantity}
                  disabled={quantity >= product.stock}
                  style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                >
                  <Ionicons name="add" size={14} color={quantity >= product.stock ? "#d1d5db" : "#374151"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.bottomBarRow}>
            <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton} activeOpacity={0.8}>
              <Ionicons name="cart-outline" size={18} color="#ffffff" />
              <Text style={styles.addToCartButtonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <Text style={styles.stockInfo}>Còn {product.stock} sp</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  mainImage: {
    width: width,
    height: width,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    position: 'absolute',
    top: 64,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  priceSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f97316',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#f97316',
    fontSize: 12,
  },
  productName: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#374151',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#d1d5db',
  },
  soldText: {
    fontSize: 14,
    color: '#6b7280',
  },
  servicesSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    color: '#374151',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  variationsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  variationGroup: {
    marginBottom: 16,
  },
  variationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  variationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  variationOptionSelected: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  variationOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  variationOptionTextSelected: {
    color: '#f97316',
  },
  shopSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    fontSize: 20,
    color: '#f97316',
    fontWeight: 'bold',
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  mallBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mallBadgeText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '600',
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  shopRatingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewShopButtonText: {
    color: '#f97316',
    fontSize: 14,
  },
  shopStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  shopStat: {
    flex: 1,
    alignItems: 'center',
  },
  shopStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  shopStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  specificationsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  specItemLast: {
    borderBottomWidth: 0,
  },
  specKey: {
    width: '33%',
    fontSize: 13,
    color: '#6b7280',
  },
  specValue: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  descriptionSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  reviewsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: '#f97316',
  },
  reviewItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  reviewItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerAvatarText: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 50,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  chatButtonText: {
    fontSize: 10,
    color: '#374151',
  },
  bottomDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  quantitySection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 6,
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityValue: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#f97316',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  addToCartButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
});
