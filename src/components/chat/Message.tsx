import React, { useState } from 'react';
import { Trash2, Edit2, MessageSquare, Smile, MoreVertical, FileIcon, Download } from 'lucide-react';
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

// Generate consistent gradient colors based on user ID
const getAvatarGradient = (userId: number): string => {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-lime-500 to-green-600',
  ];
  return gradients[userId % gradients.length];
};

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
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div
      className={`group relative px-6 py-3 hover:bg-white transition-colors ${
        isDeleted ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarGradient(message.sender_id)} flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white`}>
            {message.sender?.first_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className="font-bold text-gray-900 text-sm">
              {message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-0.5 rounded">modificato</span>
            )}
          </div>

          {/* Content */}
          {isDeleted ? (
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500 italic">
                Messaggio eliminato
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words max-w-3xl">
              {message.content}
            </div>
          )}

          {/* File Attachment */}
          {message.file_url && !isDeleted && (
            <div className="mt-3 inline-flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg max-w-md group hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <FileIcon className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-900 truncate">
                  {message.file_name || 'File'}
                </p>
                {message.file_size && (
                  <p className="text-xs text-indigo-600">
                    {(message.file_size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                title="Scarica"
              >
                <Download className="w-4 h-4 text-indigo-600" />
              </a>
            </div>
          )}

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border-2 transition-all hover:scale-105 ${
                      hasUserReacted
                        ? 'bg-indigo-100 border-indigo-400 text-indigo-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    title={reactions.map((r) => r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Unknown').join(', ')}
                  >
                    <span className="text-base leading-none">{emoji}</span>
                    <span className="font-bold">{reactions.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread Reply Count */}
          {message.thread_reply_count > 0 && onThreadClick && (
            <button
              onClick={() => onThreadClick(message)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {message.thread_reply_count}{' '}
                {message.thread_reply_count === 1 ? 'risposta' : 'risposte'}
              </span>
            </button>
          )}
        </div>

        {/* Hover Actions */}
        {showMenu && !isDeleted && (
          <div className="absolute top-2 right-6 flex items-center gap-1 bg-white border border-gray-300 rounded-lg shadow-lg px-1 py-1 z-10">
            {/* Emoji Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-indigo-50 rounded-md transition-colors group"
                title="Aggiungi reaction"
              >
                <Smile className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
              </button>

              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div className="absolute z-20 top-10 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      disabled={isAddingReaction}
                      className="hover:bg-indigo-50 p-2 rounded-md text-xl transition-all hover:scale-125"
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
                className="p-2 hover:bg-indigo-50 rounded-md transition-colors group"
                title="Rispondi in thread"
              >
                <MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
              </button>
            )}

            {/* Edit (only own messages) */}
            {isOwnMessage && onEdit && (
              <button
                onClick={() => onEdit(message)}
                className="p-2 hover:bg-amber-50 rounded-md transition-colors group"
                title="Modifica"
              >
                <Edit2 className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
              </button>
            )}

            {/* Delete (only own messages) */}
            {isOwnMessage && (
              <button
                onClick={handleDeleteMessage}
                className="p-2 hover:bg-red-50 rounded-md transition-colors group"
                title="Elimina"
              >
                <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
              </button>
            )}

            {/* More Options */}
            <button
              className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
              title="Altro"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
