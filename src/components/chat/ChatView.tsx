import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, Lock, Users, MessageCircle, Settings, Info, Bell, BellOff } from 'lucide-react';
import {
  ChatChannel,
  ChatGroup,
  ChatMessage,
  ChatMessageCreate,
  ChannelType,
} from '../../types/chat';
import { chatAPI } from '../../api/chat';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { EditMessageModal } from './EditMessageModal';

interface ChatViewProps {
  channel?: ChatChannel | null;
  group?: ChatGroup | null;
  currentUserId: number;
  onOpenThread?: (message: ChatMessage) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  channel,
  group,
  currentUserId,
  onOpenThread,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async (offset = 0) => {
    if (!channel && !group) return;

    setLoading(true);
    try {
      const params: any = {
        limit: 50,
        offset,
      };

      if (channel) {
        params.channel_id = channel.id;
      } else if (group) {
        params.group_id = group.id;
      }

      const data = await chatAPI.getMessages(params);

      if (offset === 0) {
        setMessages(data);
      } else {
        setMessages((prev) => [...data, ...prev]);
      }

      setHasMore(data.length === 50);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [channel, group]);

  useEffect(() => {
    if (channel || group) {
      fetchMessages();
    }
  }, [channel, group, fetchMessages]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (
    content: string,
    mentionedUserIds?: number[],
    fileData?: { file_url: string; file_name: string; file_size: number }
  ) => {
    if (!channel && !group) return;

    const payload: ChatMessageCreate = {
      content,
      mentioned_user_ids: mentionedUserIds,
    };

    // Add file data if present
    if (fileData) {
      payload.file_url = fileData.file_url;
      payload.file_name = fileData.file_name;
      payload.file_size = fileData.file_size;
    }

    if (channel) {
      payload.channel_id = channel.id;
    } else if (group) {
      payload.group_id = group.id;
    }

    try {
      const newMessage = await chatAPI.sendMessage(payload);
      setMessages((prev) => [...prev, newMessage]);

      // Mark as read
      if (channel) {
        await chatAPI.markChannelAsRead(channel.id, newMessage.id);
      } else if (group) {
        await chatAPI.markGroupAsRead(group.id, newMessage.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleEditMessage = async (message: ChatMessage) => {
    setEditingMessage(message);
  };

  const handleEditSuccess = (updatedMessage: ChatMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
    );
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleReactionUpdate = () => {
    // Refresh messages to update reactions
    fetchMessages();
  };

  const getHeaderIcon = () => {
    if (channel) {
      switch (channel.channel_type) {
        case ChannelType.PUBLIC:
          return <Hash className="w-6 h-6 text-indigo-600" />;
        case ChannelType.PRIVATE:
          return <Lock className="w-6 h-6 text-amber-600" />;
        case ChannelType.DEPARTMENT:
          return <Users className="w-6 h-6 text-emerald-600" />;
      }
    }
    if (group) {
      return group.is_dm ? (
        <MessageCircle className="w-6 h-6 text-emerald-600" />
      ) : (
        <Users className="w-6 h-6 text-purple-600" />
      );
    }
    return null;
  };

  const getHeaderBadge = () => {
    if (channel) {
      switch (channel.channel_type) {
        case ChannelType.PUBLIC:
          return <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Pubblico</span>;
        case ChannelType.PRIVATE:
          return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Privato</span>;
        case ChannelType.DEPARTMENT:
          return <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Reparto</span>;
      }
    }
    if (group) {
      return group.is_dm ? (
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Messaggio Diretto</span>
      ) : (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Gruppo</span>
      );
    }
    return null;
  };

  const getHeaderTitle = () => {
    if (channel) return channel.name;
    if (group) return group.name;
    return 'Seleziona una chat';
  };

  const getHeaderDescription = () => {
    if (channel) return channel.description || '';
    if (group && !group.is_dm) return 'Gruppo privato';
    return '';
  };

  if (!channel && !group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="text-center max-w-md">
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Benvenuto nella Chat Interna
          </h3>
          <p className="text-gray-500 mb-6">
            Seleziona un canale dalla sidebar o avvia una nuova conversazione per iniziare a chattare con il tuo team
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>Canali</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messaggi Diretti</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Gruppi</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              {getHeaderIcon()}
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {getHeaderTitle()}
                </h2>
                {getHeaderBadge()}
              </div>
              {getHeaderDescription() && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  <span className="truncate">{getHeaderDescription()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Notifiche"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
            </button>

            {channel && (
              <button
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Impostazioni canale"
              >
                <Settings className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <div className="text-gray-500 text-sm">Caricamento messaggi...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Load More Button */}
            {hasMore && messages.length > 0 && (
              <div className="py-4 text-center">
                <button
                  onClick={() => fetchMessages(messages.length)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Caricamento...' : 'Carica messaggi precedenti'}
                </button>
              </div>
            )}

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-1">
                    Nessun messaggio ancora
                  </h4>
                  <p className="text-sm text-gray-500">
                    Sii il primo a inviare un messaggio in questa conversazione!
                  </p>
                </div>
              </div>
            ) : (
              <div className="pb-4">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    onThreadClick={onOpenThread}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onReactionAdded={handleReactionUpdate}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        placeholder={`Messaggio a ${getHeaderTitle()}`}
      />

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};
