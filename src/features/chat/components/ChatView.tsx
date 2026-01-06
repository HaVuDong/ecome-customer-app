import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import chatService, { Message } from '../../../core/services/chatService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/constants/theme';

interface ChatViewProps {
  sellerId: number;
  sellerName: string;
  sellerAvatar?: string;
  productId?: number;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  onClose: () => void;
}

export function ChatView({
  sellerId,
  sellerName,
  sellerAvatar,
  productId,
  productName,
  productImage,
  productPrice,
  onClose,
}: ChatViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationIdState, setConversationIdState] = useState<number | null>(null);
  const [showProductCard, setShowProductCard] = useState(!!productId);
  const flatListRef = useRef<FlatList>(null);

  // Load or create conversation
  useEffect(() => {
    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      // Get or create conversation with seller
      const response = await chatService.getOrCreateConversation(sellerId);
      if (response.success && response.data) {
        setConversationIdState(response.data.id);
        // Load messages
        await loadMessages(response.data.id);
        // Mark as read
        await chatService.markAsRead(response.data.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await chatService.getMessages(conversationId, 0, 100);
      if (response.success && response.data) {
        // Messages come in descending order, reverse for display
        setMessages(response.data.content.reverse());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await chatService.sendMessage({
        receiverId: sellerId,
        content: newMessage.trim(),
        messageType: 'TEXT',
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Mark conversation as read after sending
        if (conversationIdState) {
          chatService.markAsRead(conversationIdState).catch(() => {});
        }
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendProductMessage = async () => {
    if (!productId || isSending) return;

    try {
      setIsSending(true);
      const response = await chatService.sendMessage({
        receiverId: sellerId,
        content: `Tôi quan tâm đến sản phẩm: ${productName}`,
        messageType: 'PRODUCT',
        productId: productId,
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        setShowProductCard(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending product message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return `₫${price.toLocaleString()}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Null check
    if (!item) {
      return null;
    }
    // Sử dụng isOwn từ backend để xác định tin nhắn của mình
    const isMyMessage = item.isOwn === true;
    
    // Debug log
    console.log('Message:', item.id, 'isOwn:', item.isOwn, 'isMyMessage:', isMyMessage, 'content:', item.content?.substring(0, 20));

    return (
      <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.otherMessageRow]}>
        {/* Avatar người gửi - chỉ hiển thị cho tin nhắn của người khác */}
        {!isMyMessage && (
          <View style={styles.avatarContainer}>
            {item.senderAvatar || sellerAvatar ? (
              <Image source={{ uri: item.senderAvatar || sellerAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color="#9ca3af" />
              </View>
            )}
          </View>
        )}
        
        {/* Bubble tin nhắn */}
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          {/* Tên người gửi - chỉ hiển thị cho tin nhắn người khác */}
          {!isMyMessage && item.senderName && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          {item.messageType === 'PRODUCT' && item.productId ? (
            <View style={styles.productMessageCard}>
              <Ionicons name="cube-outline" size={20} color={isMyMessage ? '#fff' : COLORS.primary} />
              <Text style={[styles.productMessageText, isMyMessage && styles.myMessageText]}>
                {item.content}
              </Text>
            </View>
          ) : (
            <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
              {item.content}
            </Text>
          )}
          
          {/* Thời gian và trạng thái */}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
              {item.createdAt ? formatTime(item.createdAt) : ''}
            </Text>
            {isMyMessage && (
              <Ionicons 
                name={item.status === 'READ' ? 'checkmark-done' : 'checkmark'} 
                size={14} 
                color="rgba(255,255,255,0.7)" 
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{sellerName}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {sellerAvatar ? (
            <Image source={{ uri: sellerAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="storefront" size={18} color="#9ca3af" />
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>{sellerName}</Text>
            <Text style={styles.headerSubtitle}>Người bán</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Product Card (if coming from product detail) */}
      {showProductCard && productId && (
        <View style={styles.productCard}>
          <Image source={{ uri: productImage }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
            <Text style={styles.productPrice}>{formatPrice(productPrice || 0)}</Text>
          </View>
          <TouchableOpacity
            style={styles.sendProductButton}
            onPress={handleSendProductMessage}
            disabled={isSending}
          >
            <Text style={styles.sendProductButtonText}>Gửi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeProductButton}
            onPress={() => setShowProductCard(false)}
          >
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Bắt đầu cuộc trò chuyện</Text>
              <Text style={styles.emptySubtext}>Hãy gửi tin nhắn đầu tiên cho {sellerName}</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  moreButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  // Message Row - container cho toàn bộ tin nhắn
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 21,
  },
  myMessageText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  productMessageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productMessageText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  sendProductButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sendProductButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  closeProductButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachButton: {
    padding: 6,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
