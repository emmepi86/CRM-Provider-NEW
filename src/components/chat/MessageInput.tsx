import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, X, FileIcon, Loader2 } from 'lucide-react';
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
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="text-sm text-indigo-900 flex items-center gap-2">
            <div className="w-1 h-10 bg-indigo-600 rounded-full"></div>
            <div>
              <span className="font-semibold block">Rispondi a {replyingTo.sender}</span>
              <span className="text-indigo-600 truncate max-w-md inline-block">
                {replyingTo.content}
              </span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-indigo-400 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File Attachment Preview */}
      {uploadedFile && (
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <FileIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-indigo-900 text-sm">{uploadedFile.file_name}</p>
              <p className="text-indigo-600 text-xs">
                {(uploadedFile.file_size / 1024).toFixed(1)} KB • Pronto per l'invio
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            disabled={isSending}
            className="text-indigo-600 hover:text-indigo-800 hover:bg-white p-2 rounded-lg transition-all disabled:opacity-50"
            title="Rimuovi file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4">
        <div className="flex items-end gap-3">
          {/* Textarea Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={uploadedFile ? 'Aggiungi un messaggio (opzionale)...' : placeholder}
              disabled={isSending || isUploading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all placeholder:text-gray-400"
              style={{ minHeight: '48px', maxHeight: '200px' }}
              rows={1}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-1">
            {/* Emoji Picker (placeholder) */}
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
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
              className={`p-3 rounded-xl transition-all ${
                isUploading
                  ? 'text-indigo-600 bg-indigo-50 animate-pulse'
                  : uploadedFile
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
              } disabled:opacity-50`}
              title={isUploading ? 'Caricamento...' : uploadedFile ? 'File allegato' : 'Allega file'}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
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
              className={`p-3 rounded-xl transition-all shadow-md ${
                (content.trim() || uploadedFile) && !isSending && !isUploading
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
              title="Invia (Enter)"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Hint Text */}
        {!uploadedFile && !isSending && (
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                Enter
              </kbd>
              <span>per inviare</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                Shift+Enter
              </kbd>
              <span>per andare a capo</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
