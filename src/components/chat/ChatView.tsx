import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, Lock, Users, MessageCircle, Settings } from 'lucide-react';
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

  const handleSendMessage = async (content: string, mentionedUserIds?: number[]) => {
    if (!channel && !group) return;

    const payload: ChatMessageCreate = {
      content,
      mentioned_user_ids: mentionedUserIds,
    };

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
    // TODO: Open edit modal or inline edit
    console.log('Edit message:', message);
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
          return <Hash className="w-6 h-6" />;
        case ChannelType.PRIVATE:
          return <Lock className="w-6 h-6" />;
        case ChannelType.DEPARTMENT:
          return <Users className="w-6 h-6" />;
      }
    }
    if (group) {
      return group.is_dm ? (
        <MessageCircle className="w-6 h-6" />
      ) : (
        <Users className="w-6 h-6" />
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
    return '';
  };

  if (!channel && !group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Benvenuto nella Chat Interna
          </h3>
          <p className="text-gray-500">
            Seleziona un canale o avvia una conversazione
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="text-gray-700">{getHeaderIcon()}</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getHeaderTitle()}
            </h2>
            {getHeaderDescription() && (
              <p className="text-sm text-gray-500">{getHeaderDescription()}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Channel Settings (if channel owner/admin) */}
          {channel && (
            <button
              className="p-2 hover:bg-gray-100 rounded"
              title="Impostazioni canale"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-white"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Caricamento messaggi...</div>
          </div>
        ) : (
          <>
            {/* Load More Button */}
            {hasMore && messages.length > 0 && (
              <div className="py-4 text-center">
                <button
                  onClick={() => fetchMessages(messages.length)}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  {loading ? 'Caricamento...' : 'Carica messaggi precedenti'}
                </button>
              </div>
            )}

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nessun messaggio ancora. Inizia la conversazione!
              </div>
            ) : (
              <div>
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
    </div>
  );
};
