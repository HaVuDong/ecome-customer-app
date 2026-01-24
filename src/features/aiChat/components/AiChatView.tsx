import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Product } from '@/src/shared/types';

interface AiChatViewProps {
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product) => void;
}

export function AiChatView({ onAddToCart, onBuyNow }: AiChatViewProps) {
  const [messages, setMessages] = useState<any[]>([
    { id: '1', from: 'ai', text: 'Xin chào! Tôi là trợ lý mua sắm. Tôi có thể gợi ý sản phẩm, thêm giỏ hàng hoặc thanh toán giúp bạn.' },
  ]);
  const [input, setInput] = useState('');
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const aiService = await import('@/src/core/services/aiService');
        const ok = await aiService.default.isAvailable();
        if (mounted) setAiOnline(ok);
      } catch (err) {
        if (mounted) setAiOnline(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg = { id: Date.now().toString(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const aiService = await import('@/src/core/services/aiService');
      const resp = await aiService.default.chatWithAi(text);
      const assistantText = resp?.assistantReply || 'Xin lỗi, AI không trả lời được.';
      setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: assistantText }]);

      // If action is present, handle ADD_TO_CART, BUY_NOW and SUGGEST_PRODUCTS
      const action = resp?.action;
      if (action && typeof action === 'object') {
        const type = String(action.type || '').toUpperCase();
        if (type === 'ADD_TO_CART') {
          const pid = Number(action.productId);
          const qty = Number(action.quantity || 1);
          // Try to add to cart via global addToCart function (provided by parent)
          if (pid && onAddToCart) {
            // fetch product minimal info so we can display it in chat card
            const productService = await import('@/src/core/services/productService');
            const p = await productService.default.getProductById(pid);
            if (p) {
              onAddToCart({
                id: String(p.id),
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                image: p.mainImage || '',
                rating: p.rating || 0,
                sold: p.soldCount || 0,
                discount: 0,
                category: p.category?.name || '',
                description: p.description || '',
                stock: p.stock || 0,
                images: [],
                shop: { name: p.seller?.fullName || 'Seller', rating: 0, products: 0, responseRate: 0, responseTime: '', followers: 0 },
                seller: undefined,
              }, qty);
              setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: `Đã thêm sản phẩm ${p.name} vào giỏ (${qty})` }]);
            }
          }
        } else if (type === 'BUY_NOW') {
          // For BUY_NOW we delegate to onBuyNow if items present
          const items = action.items;
          if (Array.isArray(items) && items.length > 0 && onBuyNow) {
            // Try to buy first item (demo)
            const first = items[0];
            const pid = Number(first.productId);
            const productService = await import('@/src/core/services/productService');
            const p = await productService.default.getProductById(pid);
            if (p) {
              onBuyNow({
                id: String(p.id),
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                image: p.mainImage || '',
                rating: p.rating || 0,
                sold: p.soldCount || 0,
                discount: 0,
                category: p.category?.name || '',
                description: p.description || '',
                stock: p.stock || 0,
                images: [],
                shop: { name: p.seller?.fullName || 'Seller', rating: 0, products: 0, responseRate: 0, responseTime: '', followers: 0 },
                seller: undefined,
              });
              setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: `Đã tạo đơn hàng cho ${p.name}` }]);
            }
          }
        } else if (type === 'SUGGEST_PRODUCTS') {
          // actionResult.products expected as array of product-like maps
          const products = resp?.actionResult?.products || [];
          if (products && Array.isArray(products) && products.length > 0) {
            setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: 'Mình tìm thấy những sản phẩm phù hợp:' }]);
            for (const prod of products) {
              // Map AI product DTO to the local product shape used in product cards
              const card = {
                id: String(prod.id),
                name: prod.name || prod.title || 'Sản phẩm',
                price: prod.price || prod.priceVnd || 0,
                originalPrice: prod.price || 0,
                mainImage: prod.mainImage || prod.image || prod.thumbnail || '',
                category: prod.categoryName || '',
                description: prod.description || '',
                stock: prod.stock || 0,
                seller: undefined,
              };
              setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: '', product: card }]);
            }
          }
        }
      }
    } catch (err) {
      console.warn('AI chat failed', err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: 'Lỗi khi gọi AI: ' + (err?.message || String(err)) }]);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.message, item.from === 'ai' ? styles.aiMessage : styles.userMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      {item.product && (
        <View style={styles.productCard}>
          <Image source={{ uri: item.product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product.name}</Text>
            <Text style={styles.productPrice}>{item.product.price.toLocaleString()} đ</Text>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(item.product, 1)}>
                <Text style={styles.actionText}>Thêm vào giỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyNowButton} onPress={() => onBuyNow(item.product)}>
                <Text style={styles.actionText}>Mua ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Trợ lý AI</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, aiOnline ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{aiOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Tư vấn sản phẩm • Thêm giỏ hàng • Thanh toán VNPAY</Text>
      </View>

      <FlatList data={messages} renderItem={renderItem} keyExtractor={(m) => m.id} contentContainerStyle={styles.list} style={styles.flatList} />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Hỏi mình về sản phẩm bạn cần..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: 88 },
  header: { padding: 16, backgroundColor: '#f97316' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '700' },
  headerSubtitle: { fontSize: 12, color: '#fff', marginTop: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  statusOnline: { backgroundColor: '#10b981' },
  statusOffline: { backgroundColor: '#ef4444' },
  statusText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  list: { padding: 12, paddingBottom: 160 },
  flatList: { flex: 1 },
  message: { marginBottom: 12 },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#fde68a', padding: 12, borderRadius: 8 },
  messageText: { fontSize: 14, color: '#111827' },
  productCard: { marginTop: 8, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  productImage: { width: 80, height: 80 },
  productInfo: { padding: 8, flex: 1 },
  productName: { fontWeight: '600' },
  productPrice: { marginTop: 6, color: '#ef4444', fontWeight: '700' },
  productActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addToCartButton: { backgroundColor: '#f97316', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  buyNowButton: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', paddingBottom: 12, elevation: 6 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#f97316', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});