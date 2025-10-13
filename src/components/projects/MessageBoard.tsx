import React, { useState } from 'react';
import { MessageSquare, Pin, Pencil, Trash2, Send } from 'lucide-react';
import { ProjectMessage, ProjectMessageComment } from '../../api/projects';

interface MessageBoardProps {
  messages: ProjectMessage[];
  currentUserId: number;
  onCreateMessage: () => void;
  onEditMessage: (message: ProjectMessage) => void;
  onDeleteMessage: (messageId: number) => void;
  onAddComment: (messageId: number, content: string) => Promise<void>;
  onEditComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

export const MessageBoard: React.FC<MessageBoardProps> = ({
  messages,
  currentUserId,
  onCreateMessage,
  onEditMessage,
  onDeleteMessage,
  onAddComment,
  onEditComment,
  onDeleteComment
}) => {
  const [expandedMessageIds, setExpandedMessageIds] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const toggleMessage = (messageId: number) => {
    setExpandedMessageIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleAddComment = async (messageId: number) => {
    const content = commentInputs[messageId]?.trim();
    if (!content) return;

    try {
      await onAddComment(messageId, content);
      setCommentInputs(prev => ({ ...prev, [messageId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingCommentContent.trim()) return;

    try {
      await onEditComment(commentId, editingCommentContent.trim());
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const startEditComment = (comment: ProjectMessageComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'question':
        return '❓';
      default:
        return '💬';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-amber-50 border-amber-200';
      case 'question':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Sort: pinned first, then by date
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedMessages.map(message => (
        <div
          key={message.id}
          className={`border rounded-lg overflow-hidden ${getMessageTypeColor(message.message_type)}`}
        >
          {/* Message Header */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {message.is_pinned && <Pin className="w-4 h-4 text-indigo-600" />}
                <span className="text-lg">{getMessageTypeIcon(message.message_type)}</span>
                {message.title && (
                  <h4 className="font-semibold text-gray-900">{message.title}</h4>
                )}
              </div>

              {message.created_by === currentUserId && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditMessage(message)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Modifica"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Sei sicuro di voler eliminare questo messaggio?')) {
                        onDeleteMessage(message.id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="text-gray-700 whitespace-pre-wrap mb-3">{message.content}</div>

            {/* Message Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium">{message.author_name || 'Unknown'}</span>
                <span>•</span>
                <span>{new Date(message.created_at).toLocaleString('it-IT')}</span>
              </div>

              <button
                onClick={() => toggleMessage(message.id)}
                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{message.comments_count || 0} commenti</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedMessageIds.includes(message.id) && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
              {/* Existing Comments */}
              {message.comments && message.comments.length > 0 ? (
                <div className="space-y-2">
                  {message.comments.map(comment => (
                    <div key={comment.id} className="bg-white rounded p-3">
                      {editingCommentId === comment.id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                            >
                              Salva
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent('');
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                            >
                              Annulla
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-700 flex-1">{comment.content}</p>
                            {comment.created_by === currentUserId && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => startEditComment(comment)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                  title="Modifica"
                                >
                                  <Pencil className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Sei sicuro di voler eliminare questo commento?')) {
                                      onDeleteComment(comment.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-red-100 rounded"
                                  title="Elimina"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {comment.author_name || 'Unknown'} • {new Date(comment.created_at).toLocaleString('it-IT')}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Nessun commento</p>
              )}

              {/* Add Comment Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInputs[message.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [message.id]: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(message.id);
                    }
                  }}
                  placeholder="Scrivi un commento..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleAddComment(message.id)}
                  disabled={!commentInputs[message.id]?.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {sortedMessages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun messaggio</h3>
          <p className="text-gray-500 mb-4">Inizia una conversazione pubblicando il primo messaggio</p>
          <button
            onClick={onCreateMessage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Nuovo Messaggio
          </button>
        </div>
      )}
    </div>
  );
};
