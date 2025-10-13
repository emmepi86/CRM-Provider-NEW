import React, { useState, useEffect } from 'react';
import { X, Mail, Calendar, Paperclip, ExternalLink, Reply, Forward, FolderInput, Trash2, Send, Upload, Sparkles, ListTodo, FolderPlus } from 'lucide-react';
import { aiAPI } from '../../api/ai';
import { projectsAPI } from '../../api/projects';

interface EmailViewModalProps {
  email: {
    uid: string;
    subject: string;
    from_name: string;
    from_email: string;
    to: string;
    cc: string[];
    date: string;
    body_text: string;
    body_html: string;
    attachments: Array<{
      filename: string;
      content_type: string;
      size: number;
    }>;
    is_read: boolean;
  };
  folderName: string;
  folders: Array<{ name: string; flags: string[] }>;
  onClose: () => void;
  onReply?: (email: any) => void;
  onForward?: (email: any) => void;
  onMove?: (uid: string, destinationFolder: string) => void;
  onDelete?: (uid: string) => void;
}

export const EmailViewModal: React.FC<EmailViewModalProps> = ({
  email,
  folderName,
  folders,
  onClose,
  onReply,
  onForward,
  onMove,
  onDelete
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showForwardComposer, setShowForwardComposer] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [forwardText, setForwardText] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [forwardAttachments, setForwardAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  // AI Assistant states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMode, setAiMode] = useState<'summarize' | 'extract-tasks' | 'smart-reply'>('summarize');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Project creation states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [todoListName, setTodoListName] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'reply' | 'forward') => {
    const files = Array.from(e.target.files || []);
    if (type === 'reply') {
      setReplyAttachments(prev => [...prev, ...files]);
    } else {
      setForwardAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number, type: 'reply' | 'forward') => {
    if (type === 'reply') {
      setReplyAttachments(prev => prev.filter((_, i) => i !== index));
    } else {
      setForwardAttachments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleReply = () => {
    setShowReplyComposer(true);
    setShowForwardComposer(false);
  };

  const handleForward = () => {
    setShowForwardComposer(true);
    setShowReplyComposer(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Inserisci il testo della risposta');
      return;
    }

    setSending(true);
    try {
      // TODO: Implement actual reply sending with attachments
      if (onReply) {
        await onReply({
          to: email.from_email,
          subject: `Re: ${email.subject}`,
          body: replyText,
          attachments: replyAttachments
        });
      }
      setShowReplyComposer(false);
      setReplyText('');
      setReplyAttachments([]);
      alert('Risposta inviata con successo!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Errore durante l\'invio della risposta');
    } finally {
      setSending(false);
    }
  };

  const handleSendForward = async () => {
    if (!forwardTo.trim() || !forwardText.trim()) {
      alert('Inserisci destinatario e testo');
      return;
    }

    setSending(true);
    try {
      // TODO: Implement actual forward sending with attachments
      if (onForward) {
        await onForward({
          to: forwardTo,
          subject: `Fwd: ${email.subject}`,
          body: forwardText,
          originalEmail: email,
          attachments: forwardAttachments
        });
      }
      setShowForwardComposer(false);
      setForwardText('');
      setForwardTo('');
      setForwardAttachments([]);
      alert('Email inoltrata con successo!');
    } catch (error) {
      console.error('Error forwarding email:', error);
      alert('Errore durante l\'inoltro');
    } finally {
      setSending(false);
    }
  };

  const handleMove = (destinationFolder: string) => {
    if (window.confirm(`Spostare questa email in "${destinationFolder}"?`)) {
      if (onMove) {
        onMove(email.uid, destinationFolder);
      }
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Eliminare definitivamente questa email dal server IMAP? Questa azione è irreversibile.')) {
      if (onDelete) {
        onDelete(email.uid);
      }
      onClose();
    }
  };

  const handleAIAction = async (mode: 'summarize' | 'extract-tasks' | 'smart-reply') => {
    setAiMode(mode);
    setShowAIModal(true);
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const request = {
        subject: email.subject || '(Nessun oggetto)',
        body_html: email.body_html,
        body_text: email.body_text,
        from_email: email.from_email,
        from_name: email.from_name
      };

      let result;
      if (mode === 'summarize') {
        result = await aiAPI.summarizeText(request);
      } else if (mode === 'extract-tasks') {
        result = await aiAPI.extractTasksFromText(request);
      } else {
        result = await aiAPI.generateSmartReplyFromText(request);
      }

      setAiResult(result);
    } catch (err: any) {
      console.error('AI Error:', err);
      setAiError(err.response?.data?.detail || 'Errore durante l\'elaborazione AI');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Visualizza Email</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Subject */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {email.subject || '(Nessun oggetto)'}
            </h3>
          </div>

          {/* From/To/Date */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600 w-20">Da:</span>
              <div className="flex-1">
                <span className="text-sm text-gray-900 font-medium">
                  {email.from_name || email.from_email}
                </span>
                {email.from_name && (
                  <span className="text-sm text-gray-600 ml-2">
                    &lt;{email.from_email}&gt;
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600 w-20">A:</span>
              <span className="text-sm text-gray-900">{email.to}</span>
            </div>

            {email.cc && email.cc.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-600 w-20">Cc:</span>
                <span className="text-sm text-gray-900">{email.cc.join(', ')}</span>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <Calendar size={16} className="text-gray-600 mt-0.5" />
              <span className="text-sm text-gray-600">{formatDateTime(email.date)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="border-t border-gray-200 pt-4">
            {email.body_html ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-gray-700 text-sm">
                {email.body_text || '(Nessun contenuto)'}
              </div>
            )}
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Paperclip size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Allegati ({email.attachments.length})
                </span>
              </div>
              <div className="space-y-2">
                {email.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
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

        {/* Reply Composer */}
        {showReplyComposer && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Rispondi</h4>
              <button
                onClick={() => {
                  setShowReplyComposer(false);
                  setReplyText('');
                  setReplyAttachments([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Scrivi la tua risposta..."
            />

            {/* Attachments */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                <Upload size={16} />
                <span>Aggiungi allegato</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'reply')}
                />
              </label>
              {replyAttachments.length > 0 && (
                <div className="space-y-1">
                  {replyAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                      <span className="text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <button onClick={() => removeAttachment(idx, 'reply')} className="text-red-600 hover:text-red-800">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowReplyComposer(false);
                  setReplyText('');
                  setReplyAttachments([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                Annulla
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Send size={16} />
                <span>{sending ? 'Invio...' : 'Invia Risposta'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Forward Composer */}
        {showForwardComposer && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Inoltra</h4>
              <button
                onClick={() => {
                  setShowForwardComposer(false);
                  setForwardText('');
                  setForwardTo('');
                  setForwardAttachments([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <input
              type="email"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Destinatario (email)"
            />
            <textarea
              value={forwardText}
              onChange={(e) => setForwardText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Aggiungi un messaggio..."
            />

            {/* Attachments */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                <Upload size={16} />
                <span>Aggiungi allegato</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'forward')}
                />
              </label>
              {forwardAttachments.length > 0 && (
                <div className="space-y-1">
                  {forwardAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                      <span className="text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <button onClick={() => removeAttachment(idx, 'forward')} className="text-red-600 hover:text-red-800">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowForwardComposer(false);
                  setForwardText('');
                  setForwardTo('');
                  setForwardAttachments([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                Annulla
              </button>
              <button
                onClick={handleSendForward}
                disabled={sending || !forwardText.trim() || !forwardTo.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Send size={16} />
                <span>{sending ? 'Invio...' : 'Inoltra'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer - Action Buttons */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReply}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Reply size={16} />
              <span>Rispondi</span>
            </button>

            {/* AI Buttons */}
            <button
              onClick={() => handleAIAction('summarize')}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center space-x-1"
              title="Riassumi con AI"
            >
              <Sparkles size={14} />
              <span>Riassumi</span>
            </button>
            <button
              onClick={() => handleAIAction('extract-tasks')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
              title="Estrai task"
            >
              <ListTodo size={14} />
              <span>Task</span>
            </button>

            <button
              onClick={handleForward}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Forward size={16} />
              <span>Inoltra</span>
            </button>

            {/* Move to Folder */}
            <div className="flex items-center space-x-1">
              <FolderInput size={16} className="text-gray-600" />
              <select
                onChange={(e) => {
                  if (e.target.value && e.target.value !== folderName) {
                    handleMove(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                <option value="">Sposta in...</option>
                {folders.filter(f => f.name !== folderName).map((folder) => (
                  <option key={folder.name} value={folder.name}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Elimina</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            Chiudi
          </button>
        </div>
      </div>

      {/* AI Result Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center space-x-2 text-white">
                <Sparkles size={20} />
                <h3 className="font-semibold">
                  {aiMode === 'summarize' && 'Riassunto Email'}
                  {aiMode === 'extract-tasks' && 'Task Estratti'}
                  {aiMode === 'smart-reply' && 'Risposta Suggerita'}
                </h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {aiLoading && (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Elaborazione AI in corso...</p>
                </div>
              )}

              {aiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p className="font-medium">Errore</p>
                  <p className="text-sm mt-1">{aiError}</p>
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="space-y-4">
                  {/* Summary Result */}
                  {aiMode === 'summarize' && (
                    <>
                      {aiResult.sentiment && (
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {aiResult.sentiment}
                        </div>
                      )}
                      {aiResult.summary && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Riassunto</h4>
                          <p className="text-gray-700">{aiResult.summary}</p>
                        </div>
                      )}
                      {aiResult.key_points && aiResult.key_points.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Punti Chiave</h4>
                          <ul className="space-y-1">
                            {aiResult.key_points.map((point: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tasks Result */}
                  {aiMode === 'extract-tasks' && (
                    <>
                      <p className="text-sm text-gray-600">
                        {aiResult.tasks_found} task trovati
                      </p>
                      {aiResult.tasks && aiResult.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {aiResult.tasks.map((task: any, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{task.title}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              {(task.due_date || task.estimated_hours) && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {task.due_date && <span>📅 {task.due_date}</span>}
                                  {task.estimated_hours && <span className="ml-3">⏱️ {task.estimated_hours}h</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nessun task trovato</p>
                      )}
                    </>
                  )}

                  {/* Smart Reply Result */}
                  {aiMode === 'smart-reply' && (
                    <>
                      {aiResult.subject && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Oggetto</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{aiResult.subject}</p>
                        </div>
                      )}
                      {aiResult.body && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Risposta</h4>
                          <div className="text-gray-700 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                            {aiResult.body}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between">
              {aiMode === 'extract-tasks' && aiResult?.tasks && aiResult.tasks.length > 0 && (
                <button
                  onClick={async () => {
                    const projectName = prompt('Nome del progetto:');
                    if (!projectName) return;

                    try {
                      setCreatingProject(true);
                      const result = await aiAPI.createProjectFromTasks({
                        project_name: projectName,
                        todo_list_name: `Task da: ${email.subject}`,
                        email_subject: email.subject,
                        email_from: email.from_email,
                        email_date: email.date,
                        tasks: aiResult.tasks
                      });
                      alert(`✅ Progetto "${result.project_name}" creato!\n\n📋 ${result.tasks_count} task creati:\n${result.created_tasks.map((t: any) => `• ${t.title} (${t.priority})`).join('\n')}\n\nVai su Progetti per vedere i dettagli.`);
                      setShowAIModal(false);
                      // Optionally redirect to project
                      if (window.confirm('Vuoi aprire il progetto ora?')) {
                        window.location.href = `/projects/${result.project_id}`;
                      }
                    } catch (error: any) {
                      alert('Errore creazione progetto: ' + (error.response?.data?.detail || error.message));
                    } finally {
                      setCreatingProject(false);
                    }
                  }}
                  disabled={creatingProject}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <FolderPlus size={16} />
                  <span>{creatingProject ? 'Creazione...' : 'Crea Progetto'}</span>
                </button>
              )}
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
