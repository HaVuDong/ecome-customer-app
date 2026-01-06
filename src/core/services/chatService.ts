import apiClient from './api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface Message {
  id: number;
  conversationId: number;
  // Backend trả về senderId/receiverId thay vì object
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  receiverName: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'PRODUCT';
  imageUrl?: string;
  productId?: number;
  product?: {
    id: number;
    name: string;
    mainImage: string;
    price: number;
  };
  status: 'SENT' | 'DELIVERED' | 'READ';
  readAt?: string;
  createdAt: string;
  isOwn: boolean; // Backend trả về isOwn để biết tin nhắn của ai
}

export interface Conversation {
  id: number;
  // Thông tin người còn lại trong cuộc hội thoại
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserRole: string;
  // Tin nhắn cuối
  lastMessage?: string;
  lastSenderId?: number;
  lastMessageAt?: string;
  // Số tin nhắn chưa đọc
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'PRODUCT';
  productId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ChatService {
  /**
   * Lấy danh sách cuộc hội thoại
   */
  async getConversations(page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Conversation>>> {
    const response = await apiClient.get('/chat/conversations', {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Lấy hoặc tạo cuộc hội thoại với user khác (seller)
   */
  async getOrCreateConversation(userId: number): Promise<ApiResponse<Conversation>> {
    const response = await apiClient.post('/chat/conversations', { userId });
    return response.data;
  }

  /**
   * Lấy chi tiết cuộc hội thoại
   */
  async getConversation(conversationId: number): Promise<ApiResponse<Conversation>> {
    const response = await apiClient.get(`/chat/conversations/${conversationId}`);
    return response.data;
  }

  /**
   * Lấy tin nhắn của cuộc hội thoại
   */
  async getMessages(conversationId: number, page: number = 0, size: number = 50): Promise<ApiResponse<PageResponse<Message>>> {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    const response = await apiClient.post('/chat/messages', request);
    return response.data;
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(conversationId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  }

  /**
   * Lấy số tin nhắn chưa đọc
   */
  async getUnreadCount(): Promise<ApiResponse<{ unreadMessages: number; unreadConversations: number }>> {
    const response = await apiClient.get('/chat/unread-count');
    return response.data;
  }
}

export default new ChatService();
