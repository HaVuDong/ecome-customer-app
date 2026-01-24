import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
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

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simple demo response with a suggested product card
    setTimeout(() => {
      const suggested: Product = {
        id: 'ai-suggest-1',
        name: 'Tai nghe không dây AI',
        price: 499000,
        originalPrice: undefined,
        image: 'https://via.placeholder.com/200',
        rating: 4.6,
        sold: 120,
        discount: 0,
        category: 'Điện tử',
        description: 'Tai nghe không dây chất lượng cao do AI gợi ý.',
        stock: 10,
        images: [],
        shop: { name: 'Shop AI', rating: 4.9, products: 10, responseRate: 99, responseTime: '1 phút', followers: 200 },
        seller: undefined,
      };
      setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'ai', text: 'Mình gợi ý sản phẩm này:', product: suggested }]);
    }, 700);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trợ lý AI</Text>
        <Text style={styles.headerSubtitle}>Tư vấn sản phẩm • Thêm giỏ hàng • Thanh toán VNPAY</Text>
      </View>

      <FlatList data={messages} renderItem={renderItem} keyExtractor={(m) => m.id} contentContainerStyle={styles.list} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, backgroundColor: '#f97316' },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '700' },
  headerSubtitle: { fontSize: 12, color: '#fff', marginTop: 4 },
  list: { padding: 12 },
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
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#f97316', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});