import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { ChatMessage, ChatMessageCreate } from '../../types/chat';
import { chatAPI } from '../../api/chat';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

interface ThreadViewProps {
  parentMessage: ChatMessage;
  currentUserId: number;
  onClose: () => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  currentUserId,
  onClose,
}) => {
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatAPI.getMessages({
        parent_message_id: parentMessage.id,
        limit: 100,
      });
      setThreadMessages(data);
    } catch (error) {
      console.error('Failed to fetch thread messages:', error);
    } finally {
      setLoading(false);
    }
  }, [parentMessage.id]);

  useEffect(() => {
    fetchThreadMessages();
  }, [fetchThreadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendReply = async (content: string, mentionedUserIds?: number[]) => {
    const payload: ChatMessageCreate = {
      content,
      parent_message_id: parentMessage.id,
      mentioned_user_ids: mentionedUserIds,
    };

    // Use same channel/group as parent
    if (parentMessage.channel_id) {
      payload.channel_id = parentMessage.channel_id;
    } else if (parentMessage.group_id) {
      payload.group_id = parentMessage.group_id;
    }

    try {
      const newMessage = await chatAPI.sendMessage(payload);
      setThreadMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send thread reply:', error);
      throw error;
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setThreadMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleReactionUpdate = () => {
    fetchThreadMessages();
  };

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Thread</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded"
          title="Chiudi thread"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Parent Message */}
      <div className="border-b border-gray-200 bg-gray-50">
        <Message
          message={parentMessage}
          currentUserId={currentUserId}
          onReactionAdded={handleReactionUpdate}
        />
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Caricamento risposte...</div>
          </div>
        ) : threadMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
            Nessuna risposta ancora. Sii il primo a rispondere!
          </div>
        ) : (
          <div>
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
              {threadMessages.length}{' '}
              {threadMessages.length === 1 ? 'risposta' : 'risposte'}
            </div>
            {threadMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onDelete={handleDeleteMessage}
                onReactionAdded={handleReactionUpdate}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply Input */}
      <MessageInput
        onSend={handleSendReply}
        placeholder="Rispondi al thread..."
        replyingTo={{
          id: parentMessage.id,
          content: parentMessage.content,
          sender: parentMessage.sender?.full_name || 'Unknown',
        }}
      />
    </div>
  );
};
