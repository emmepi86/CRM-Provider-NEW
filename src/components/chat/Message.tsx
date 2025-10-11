import React, { useState } from 'react';
import { Trash2, Edit2, MessageSquare, Smile, MoreVertical } from 'lucide-react';
import { ChatMessage, ChatReaction } from '../../types/chat';
import { chatAPI } from '../../api/chat';

interface MessageProps {
  message: ChatMessage;
  currentUserId: number;
  onThreadClick?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: number) => void;
  onReactionAdded?: () => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🚀', '👀'];

export const Message: React.FC<MessageProps> = ({
  message,
  currentUserId,
  onThreadClick,
  onEdit,
  onDelete,
  onReactionAdded,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAddingReaction, setIsAddingReaction] = useState(false);

  const isOwnMessage = message.sender_id === currentUserId;
  const isDeleted = message.is_deleted;

  const handleAddReaction = async (emoji: string) => {
    setIsAddingReaction(true);
    try {
      await chatAPI.addReaction(message.id, emoji);
      setShowEmojiPicker(false);
      onReactionAdded?.();
    } catch (error) {
      console.error('Failed to add reaction:', error);
      alert('Errore aggiungendo reaction');
    } finally {
      setIsAddingReaction(false);
    }
  };

  const handleRemoveReaction = async (reactionId: number) => {
    try {
      await chatAPI.removeReaction(reactionId);
      onReactionAdded?.();
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!window.confirm('Eliminare questo messaggio?')) return;
    try {
      await chatAPI.deleteMessage(message.id);
      onDelete?.(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Errore eliminando messaggio');
    }
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, ChatReaction[]>);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    }
  };

  return (
    <div
      className={`group relative px-4 py-2 hover:bg-gray-50 ${
        isDeleted ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {message.sender?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-semibold text-gray-900">
              {message.sender?.full_name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-gray-400 italic">(modificato)</span>
            )}
          </div>

          {/* Content */}
          {isDeleted ? (
            <p className="text-sm text-gray-400 italic">
              Messaggio eliminato
            </p>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* File Attachment */}
          {message.file_url && !isDeleted && (
            <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-200 max-w-md">
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <span className="truncate">{message.file_name || 'File'}</span>
                {message.file_size && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({(message.file_size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </a>
            </div>
          )}

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                const hasUserReacted = reactions.some(
                  (r) => r.user_id === currentUserId
                );
                const userReaction = reactions.find(
                  (r) => r.user_id === currentUserId
                );

                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      if (hasUserReacted && userReaction) {
                        handleRemoveReaction(userReaction.id);
                      } else {
                        handleAddReaction(emoji);
                      }
                    }}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                      hasUserReacted
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={reactions.map((r) => r.user?.full_name).join(', ')}
                  >
                    <span>{emoji}</span>
                    <span className="ml-1">{reactions.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread Reply Count */}
          {message.thread_reply_count > 0 && onThreadClick && (
            <button
              onClick={() => onThreadClick(message)}
              className="mt-2 text-xs text-blue-600 hover:underline flex items-center"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {message.thread_reply_count}{' '}
              {message.thread_reply_count === 1 ? 'risposta' : 'risposte'}
            </button>
          )}
        </div>

        {/* Hover Actions */}
        {showMenu && !isDeleted && (
          <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded shadow-sm px-1 py-1">
            {/* Emoji Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Aggiungi reaction"
              >
                <Smile className="w-4 h-4 text-gray-600" />
              </button>

              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div className="absolute z-10 top-8 right-0 bg-white border border-gray-200 rounded shadow-lg p-2 flex space-x-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      disabled={isAddingReaction}
                      className="hover:bg-gray-100 p-1 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thread Reply */}
            {onThreadClick && !message.parent_message_id && (
              <button
                onClick={() => onThreadClick(message)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Rispondi in thread"
              >
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Edit (only own messages) */}
            {isOwnMessage && onEdit && (
              <button
                onClick={() => onEdit(message)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Modifica"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Delete (only own messages) */}
            {isOwnMessage && (
              <button
                onClick={handleDeleteMessage}
                className="p-1 hover:bg-gray-100 rounded"
                title="Elimina"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}

            {/* More Options */}
            <button className="p-1 hover:bg-gray-100 rounded" title="Altro">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
