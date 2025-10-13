import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Reply, Archive, Trash2, User, Calendar,
  Paperclip, ExternalLink, Forward, FolderInput, Sparkles, FileText, ListTodo
} from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import type { ReceivedEmail, EmailThread } from '../../types/inbox';
import { EmailComposer } from '../../components/inbox/EmailComposer';
import { ForwardEmailModal } from '../../components/inbox/ForwardEmailModal';
import { AIAssistantModal } from '../../components/inbox/AIAssistantModal';
import { EmailToTaskModal } from '../../components/inbox/EmailToTaskModal';

export const ThreadView: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<EmailThread | null>(null);
  const [messages, setMessages] = useState<ReceivedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<ReceivedEmail | null>(null);
  const [folders, setFolders] = useState<Array<{ name: string; flags: string[] }>>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // AI Assistant states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiEmailId, setAiEmailId] = useState<number | null>(null);
  const [aiMode, setAiMode] = useState<'summarize' | 'extract-tasks' | 'smart-reply'>('summarize');
  const [aiGeneratedBody, setAiGeneratedBody] = useState<string>('');

  // Email to Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [emailForTask, setEmailForTask] = useState<ReceivedEmail | null>(null);

  useEffect(() => {
    if (threadId) {
      fetchThread(parseInt(threadId));
      fetchMessages(parseInt(threadId));
      loadFolders();
    }
  }, [threadId]);

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const result = await inboxAPI.listFolders();
      if (result.success) {
        setFolders(result.folders);
      }
    } catch (error) {
      console.error('Errore caricamento cartelle:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchThread = async (id: number) => {
    try {
      const data = await inboxAPI.getThread(id);
      setThread(data);
    } catch (error) {
      console.error('Errore caricamento thread:', error);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      setLoading(true);
      const response = await inboxAPI.getThreadMessages(id, true); // mark as read
      setMessages(response.items);
    } catch (error) {
      console.error('Errore caricamento messaggi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySuccess = () => {
    setShowComposer(false);
    setAiGeneratedBody(''); // Reset AI body
    if (threadId) {
      fetchMessages(parseInt(threadId));
    }
  };

  const handleArchive = async () => {
    if (!messages.length) return;

    if (window.confirm('Archiviare questa conversazione?')) {
      try {
        // Archive first message (will archive thread)
        await inboxAPI.archiveMessage(messages[0].id);
        navigate('/inbox');
      } catch (error) {
        console.error('Errore archiviazione:', error);
        alert('Errore durante l\'archiviazione');
      }
    }
  };

  const handleDeleteFromServer = async (messageId: number) => {
    if (window.confirm('Eliminare definitivamente questo messaggio dal server IMAP? Questa azione è irreversibile.')) {
      try {
        await inboxAPI.deleteFromServer(messageId);
        alert('Messaggio eliminato dal server');
        // Refresh messages
        if (threadId) {
          fetchMessages(parseInt(threadId));
        }
      } catch (error) {
        console.error('Errore eliminazione:', error);
        alert('Errore durante l\'eliminazione dal server');
      }
    }
  };

  const handleMoveToFolder = async (messageId: number, destinationFolder: string) => {
    try {
      await inboxAPI.moveToFolder(messageId, destinationFolder);
      alert(`Messaggio spostato in ${destinationFolder}`);
      // Refresh messages
      if (threadId) {
        fetchMessages(parseInt(threadId));
      }
    } catch (error) {
      console.error('Errore spostamento:', error);
      alert('Errore durante lo spostamento del messaggio');
    }
  };

  const handleOpenAI = (emailId: number, mode: 'summarize' | 'extract-tasks' | 'smart-reply') => {
    setAiEmailId(emailId);
    setAiMode(mode);
    setShowAIModal(true);
  };

  const handleTasksCreated = (taskIds: number[]) => {
    console.log('Tasks created:', taskIds);
    // You could navigate to project page or show notification
  };

  const handleReplyGenerated = (subject: string, body: string) => {
    // Save AI generated body and open composer
    setAiGeneratedBody(body);
    setShowAIModal(false);
    setShowComposer(true);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento conversazione...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Conversazione non trovata</p>
        <button
          onClick={() => navigate('/inbox')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Torna all'Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/inbox')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Inbox</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComposer(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Reply size={16} />
              <span>Rispondi</span>
            </button>

            <button
              onClick={() => {
                if (messages.length > 0) {
                  // Generate smart reply for the most recent message
                  handleOpenAI(messages[messages.length - 1].id, 'smart-reply');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2"
            >
              <Sparkles size={16} />
              <span>Risposta AI</span>
            </button>

            <button
              onClick={() => {
                if (messages.length > 0) {
                  setMessageToForward(messages[messages.length - 1]);
                  setShowForwardModal(true);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Forward size={16} />
              <span>Inoltra</span>
            </button>

            <button
              onClick={() => {
                if (messages.length > 0) {
                  setEmailForTask(messages[messages.length - 1]);
                  setShowTaskModal(true);
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <ListTodo size={16} />
              <span>Crea Task</span>
            </button>

            <button
              onClick={handleArchive}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Archive size={16} />
              <span>Archivia</span>
            </button>
          </div>
        </div>

        {/* Thread Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {thread.subject || '(Nessun oggetto)'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{messages.length} messaggi</span>
            {thread.participant_name && (
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>{thread.participant_name}</span>
              </div>
            )}
            {thread.event_title && (
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{thread.event_title}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={message.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Message Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-600" size={20} />
                  </div>

                  {/* From Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {message.from_name || message.from_email}
                      </span>
                      {message.participant_name && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          Partecipante
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>{message.from_email}</span>
                      <span className="mx-2">→</span>
                      <span>{message.to_email}</span>
                    </div>
                    {message.cc_emails.length > 0 && (
                      <div className="text-sm text-gray-500">
                        CC: {message.cc_emails.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date and Actions */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm text-gray-500">
                    {formatDateTime(message.received_at)}
                  </div>

                  {/* AI Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenAI(message.id, 'summarize')}
                      className="px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 flex items-center space-x-1"
                      title="Riassumi con AI"
                    >
                      <Sparkles size={12} />
                      <span>Riassumi</span>
                    </button>
                    <button
                      onClick={() => handleOpenAI(message.id, 'extract-tasks')}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                      title="Estrai task"
                    >
                      <ListTodo size={12} />
                      <span>Task</span>
                    </button>
                  </div>

                  {/* Regular Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Move to folder */}
                    <div className="flex items-center space-x-1">
                      <FolderInput size={14} className="text-gray-600" />
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleMoveToFolder(message.id, e.target.value);
                            e.target.value = ''; // Reset selection
                          }
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50"
                        disabled={loadingFolders || folders.length === 0}
                        title="Sposta in cartella"
                      >
                        <option value="">Sposta in...</option>
                        {folders.map((folder) => (
                          <option key={folder.name} value={folder.name}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteFromServer(message.id)}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm"
                      title="Elimina dal server IMAP"
                    >
                      <Trash2 size={14} />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="px-6 py-4">
              {message.body_html ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.body_html }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700">
                  {message.body_text || '(Nessun contenuto)'}
                </div>
              )}
            </div>

            {/* Attachments */}
            {message.has_attachments && message.attachments.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Paperclip size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Allegati ({message.attachments.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {message.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{att.filename}</span>
                        <span className="text-xs text-gray-500">
                          ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email Composer Modal */}
      {showComposer && threadId && (
        <EmailComposer
          threadId={parseInt(threadId)}
          onClose={() => {
            setShowComposer(false);
            setAiGeneratedBody(''); // Reset AI body on close
          }}
          onSuccess={handleReplySuccess}
          initialBody={aiGeneratedBody}
        />
      )}

      {/* Forward Email Modal */}
      {showForwardModal && messageToForward && (
        <ForwardEmailModal
          message={messageToForward}
          onClose={() => {
            setShowForwardModal(false);
            setMessageToForward(null);
          }}
          onSuccess={() => {
            setShowForwardModal(false);
            setMessageToForward(null);
          }}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && aiEmailId && (
        <AIAssistantModal
          emailId={aiEmailId}
          mode={aiMode}
          onClose={() => {
            setShowAIModal(false);
            setAiEmailId(null);
          }}
          onTasksCreated={handleTasksCreated}
          onReplyGenerated={handleReplyGenerated}
        />
      )}

      {/* Email to Task Modal */}
      {showTaskModal && emailForTask && (
        <EmailToTaskModal
          isOpen={showTaskModal}
          email={emailForTask}
          onClose={() => {
            setShowTaskModal(false);
            setEmailForTask(null);
          }}
          onSuccess={() => {
            setShowTaskModal(false);
            setEmailForTask(null);
            // Optional: show success message
            alert('Task creato con successo!');
          }}
        />
      )}
    </div>
  );
};
