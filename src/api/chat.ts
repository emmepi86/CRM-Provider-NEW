import { apiClient } from './client';
import {
  ChatChannel,
  ChatChannelDetail,
  ChatChannelCreate,
  ChatChannelUpdate,
  ChatGroup,
  ChatGroupDetail,
  ChatGroupCreate,
  ChatMessage,
  ChatMessageCreate,
  ChatMessageUpdate,
  ChatReaction,
  UnreadCount,
  MessageSearchParams,
  ChannelListParams,
  GroupListParams,
} from '../types/chat';

export const chatAPI = {
  // ========== CHANNELS ==========

  /**
   * List all channels (filtered by permissions)
   */
  listChannels: async (params?: ChannelListParams): Promise<ChatChannel[]> => {
    const { data } = await apiClient.get('/chat/channels', { params });
    return data;
  },

  /**
   * Get channel details with members
   */
  getChannel: async (channelId: number): Promise<ChatChannelDetail> => {
    const { data } = await apiClient.get(`/chat/channels/${channelId}`);
    return data;
  },

  /**
   * Create new channel
   */
  createChannel: async (payload: ChatChannelCreate): Promise<ChatChannel> => {
    const { data } = await apiClient.post('/chat/channels', payload);
    return data;
  },

  /**
   * Update channel
   */
  updateChannel: async (
    channelId: number,
    payload: ChatChannelUpdate
  ): Promise<ChatChannel> => {
    const { data } = await apiClient.put(`/chat/channels/${channelId}`, payload);
    return data;
  },

  /**
   * Add member to channel
   */
  addChannelMember: async (
    channelId: number,
    userId: number,
    role?: string
  ): Promise<void> => {
    await apiClient.post(`/chat/channels/${channelId}/members`, {
      user_id: userId,
      role: role || 'member',
    });
  },

  /**
   * Remove member from channel
   */
  removeChannelMember: async (channelId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/chat/channels/${channelId}/members/${userId}`);
  },

  /**
   * Mark channel as read (update last_read_message_id)
   */
  markChannelAsRead: async (channelId: number, messageId: number): Promise<void> => {
    await apiClient.put(`/chat/channels/${channelId}/read-status`, {
      last_read_message_id: messageId,
    });
  },

  // ========== GROUPS (DMs) ==========

  /**
   * List user's groups
   */
  listGroups: async (params?: GroupListParams): Promise<ChatGroup[]> => {
    const { data } = await apiClient.get('/chat/groups', { params });
    return data;
  },

  /**
   * Get group details with members
   */
  getGroup: async (groupId: number): Promise<ChatGroupDetail> => {
    const { data } = await apiClient.get(`/chat/groups/${groupId}`);
    return data;
  },

  /**
   * Create new group or DM
   */
  createGroup: async (payload: ChatGroupCreate): Promise<ChatGroup> => {
    const { data } = await apiClient.post('/chat/groups', payload);
    return data;
  },

  /**
   * Mark group as read
   */
  markGroupAsRead: async (groupId: number, messageId: number): Promise<void> => {
    await apiClient.put(`/chat/groups/${groupId}/read-status`, {
      last_read_message_id: messageId,
    });
  },

  // ========== MESSAGES ==========

  /**
   * Get messages (with pagination and filters)
   */
  getMessages: async (params: MessageSearchParams): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get('/chat/messages', { params });
    return data;
  },

  /**
   * Send message
   */
  sendMessage: async (payload: ChatMessageCreate): Promise<ChatMessage> => {
    const { data } = await apiClient.post('/chat/messages', payload);
    return data;
  },

  /**
   * Edit message
   */
  editMessage: async (
    messageId: number,
    payload: ChatMessageUpdate
  ): Promise<ChatMessage> => {
    const { data } = await apiClient.put(`/chat/messages/${messageId}`, payload);
    return data;
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: number): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}`);
  },

  // ========== REACTIONS ==========

  /**
   * Add reaction to message
   */
  addReaction: async (
    messageId: number,
    emoji: string
  ): Promise<ChatReaction> => {
    const { data } = await apiClient.post(
      `/chat/messages/${messageId}/reactions`,
      { emoji }
    );
    return data;
  },

  /**
   * Remove reaction
   */
  removeReaction: async (reactionId: number): Promise<void> => {
    await apiClient.delete(`/chat/reactions/${reactionId}`);
  },

  // ========== UTILITY ==========

  /**
   * Get unread counts (for all channels/groups)
   */
  getUnreadCounts: async (): Promise<UnreadCount[]> => {
    const { data } = await apiClient.get('/chat/unread');
    return data;
  },

  /**
   * Search messages (full-text)
   */
  searchMessages: async (query: string): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get('/chat/search/messages', {
      params: { query },
    });
    return data;
  },
};
