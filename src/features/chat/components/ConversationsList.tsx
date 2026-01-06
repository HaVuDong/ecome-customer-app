import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import chatService, { Conversation } from '../../../core/services/chatService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/constants/theme';

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onClose: () => void;
}

export function ConversationsList({ onSelectConversation, onClose }: ConversationsListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getConversations(0, 50);
      if (response.success && response.data) {
        setConversations(response.data.content);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      if (response.success && response.data !== undefined) {
        setUnreadCount(response.data.unreadMessages || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadConversations(), loadUnreadCount()]);
    setRefreshing(false);
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => onSelectConversation(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.otherUserAvatar ? (
            <Image source={{ uri: item.otherUserAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="storefront" size={22} color="#9ca3af" />
            </View>
          )}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]} numberOfLines={1}>
              {item.otherUserName || 'Shop'}
            </Text>
            {item.lastMessageAt && (
              <Text style={[styles.timeText, hasUnread && styles.unreadTimeText]}>
                {formatTime(item.lastMessageAt)}
              </Text>
            )}
          </View>
          {item.lastMessage && (
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]}
              numberOfLines={1}
            >
              {item.lastSenderId === user?.id ? 'Bạn: ' : ''}
              {item.lastMessage}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubtext}>
                Bắt đầu chat với người bán từ trang chi tiết sản phẩm
              </Text>
            </View>
          }
        />
      )}
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
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unreadConversation: {
    backgroundColor: '#fff7ed',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '600',
    color: '#1f2937',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadTimeText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  unreadLastMessage: {
    color: '#374151',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
