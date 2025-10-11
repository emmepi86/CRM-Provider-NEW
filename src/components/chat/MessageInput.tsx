import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, X, FileIcon } from 'lucide-react';
import { chatAPI } from '../../api/chat';

interface MessageInputProps {
  onSend: (content: string, mentionedUserIds?: number[], fileData?: { file_url: string; file_name: string; file_size: number }) => Promise<void>;
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
  const [uploadedFile, setUploadedFile] = useState<{ file_url: string; file_name: string; file_size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if ((!content.trim() && !uploadedFile) || isSending) return;

    setIsSending(true);
    try {
      const mentionedUserIds: number[] = [];
      await onSend(content.trim() || '📎 File allegato', mentionedUserIds, uploadedFile || undefined);
      setContent('');
      setUploadedFile(null);

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Il file è troppo grande. Dimensione massima: 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileData = await chatAPI.uploadFile(file);
      setUploadedFile(fileData);
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.response?.data?.detail || 'Errore caricando il file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
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

      {/* File Attachment Preview */}
      {uploadedFile && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <FileIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">{uploadedFile.file_name}</span>
            <span className="text-blue-600">({(uploadedFile.file_size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={handleRemoveFile}
            disabled={isSending}
            className="text-blue-600 hover:text-blue-800"
            title="Rimuovi file"
          >
            <X className="w-4 h-4" />
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
              placeholder={uploadedFile ? 'Aggiungi un messaggio (opzionale)' : placeholder}
              disabled={isSending || isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
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
              disabled={isUploading || isSending}
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* File Attachment */}
            <button
              type="button"
              onClick={handleFileClick}
              disabled={isUploading || isSending || !!uploadedFile}
              className={`p-2 rounded hover:bg-gray-100 ${
                isUploading
                  ? 'text-blue-500 animate-pulse'
                  : uploadedFile
                  ? 'text-green-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isUploading ? 'Caricamento...' : 'Allega file'}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip"
            />

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && !uploadedFile) || isSending || isUploading}
              className={`p-2 rounded-lg ${
                (content.trim() || uploadedFile) && !isSending && !isUploading
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
        {!uploadedFile && (
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
        )}
      </div>
    </div>
  );
};
