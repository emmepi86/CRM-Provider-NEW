import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string, mentionedUserIds?: number[]) => Promise<void>;
  placeholder?: string;
  replyingTo?: {
    id: number;
    content: string;
    sender: string;
  } | null;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Scrivi un messaggio...',
  replyingTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      // TODO: Extract @mentions and convert to user_ids
      // const mentionPattern = /@(\w+)/g;
      // const mentions = content.match(mentionPattern);
      const mentionedUserIds: number[] = [];

      await onSend(content.trim(), mentionedUserIds);
      setContent('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Errore inviando messaggio');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Replying To Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Rispondi a {replyingTo.sender}:</span>{' '}
            <span className="text-gray-500 truncate max-w-md inline-block align-bottom">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3">
        <div className="flex items-end space-x-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '40px', maxHeight: '200px' }}
              rows={1}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pb-2">
            {/* Emoji Picker (placeholder) */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              title="Aggiungi emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* File Attachment (placeholder) */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              title="Allega file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSending}
              className={`p-2 rounded-lg ${
                content.trim() && !isSending
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Invia (Enter)"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-400 mt-2">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Enter
          </kbd>{' '}
          per inviare,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Shift+Enter
          </kbd>{' '}
          per andare a capo
        </p>
      </div>
    </div>
  );
};
