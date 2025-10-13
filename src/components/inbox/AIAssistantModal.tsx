import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, CheckCircle, AlertCircle, FileText, ListTodo, MessageSquare } from 'lucide-react';
import { aiAPI } from '../../api/ai';
import type { EmailSummary, TaskExtractionResult, SmartReply } from '../../api/ai';

interface AIAssistantModalProps {
  emailId: number;
  mode: 'summarize' | 'extract-tasks' | 'smart-reply';
  onClose: () => void;
  onTasksCreated?: (taskIds: number[]) => void;
  onReplyGenerated?: (subject: string, body: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  emailId,
  mode,
  onClose,
  onTasksCreated,
  onReplyGenerated,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary data
  const [summary, setSummary] = useState<EmailSummary | null>(null);

  // Task extraction data
  const [taskResult, setTaskResult] = useState<TaskExtractionResult | null>(null);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [autoCreate, setAutoCreate] = useState(false);

  // Smart reply data
  const [reply, setReply] = useState<SmartReply | null>(null);
  const [context, setContext] = useState('');

  useEffect(() => {
    loadAIData();
  }, [emailId, mode]);

  const loadAIData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (mode === 'summarize') {
        const data = await aiAPI.summarizeEmail(emailId);
        setSummary(data);
      } else if (mode === 'extract-tasks') {
        const data = await aiAPI.extractTasks(emailId);
        setTaskResult(data);
      } else if (mode === 'smart-reply') {
        const data = await aiAPI.generateSmartReply(emailId);
        setReply(data);
      }
    } catch (err: any) {
      console.error('AI processing error:', err);
      setError(err.response?.data?.detail || 'Errore durante l\'elaborazione AI');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!projectId) {
      alert('Seleziona un progetto prima di creare i task');
      return;
    }

    try {
      setLoading(true);
      const data = await aiAPI.extractTasks(emailId, projectId, true);
      setTaskResult(data);

      if (data.created_task_ids.length > 0 && onTasksCreated) {
        onTasksCreated(data.created_task_ids);
        alert(`${data.created_task_ids.length} task creati con successo!`);
      }
    } catch (err: any) {
      console.error('Error creating tasks:', err);
      alert('Errore durante la creazione dei task');
    } finally {
      setLoading(false);
    }
  };

  const handleUseReply = () => {
    if (reply && onReplyGenerated) {
      onReplyGenerated(reply.subject, reply.body);
      onClose();
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Positivo';
      case 'negative': return 'Negativo';
      case 'urgent': return 'Urgente';
      default: return 'Neutrale';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTitleByMode = () => {
    switch (mode) {
      case 'summarize': return 'Riassunto Email';
      case 'extract-tasks': return 'Estrazione Task';
      case 'smart-reply': return 'Risposta Intelligente';
    }
  };

  const getIconByMode = () => {
    switch (mode) {
      case 'summarize': return <FileText className="w-5 h-5" />;
      case 'extract-tasks': return <ListTodo className="w-5 h-5" />;
      case 'smart-reply': return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {getIconByMode()}
            <h2 className="text-lg font-semibold text-gray-900">{getTitleByMode()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Elaborazione AI in corso...</p>
              <p className="text-sm text-gray-500 mt-2">
                {mode === 'summarize' && 'Analisi del contenuto email...'}
                {mode === 'extract-tasks' && 'Estrazione task operativi...'}
                {mode === 'smart-reply' && 'Generazione risposta...'}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Errore</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Summary View */}
          {!loading && !error && mode === 'summarize' && summary && (
            <div className="space-y-6">
              {/* Sentiment Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(summary.sentiment)}`}>
                  {getSentimentLabel(summary.sentiment)}
                </span>
                {summary.action_required && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                    Azione Richiesta
                  </span>
                )}
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Riassunto</h3>
                <p className="text-gray-900 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Key Points */}
              {summary.key_points.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Punti Chiave</h3>
                  <ul className="space-y-2">
                    {summary.key_points.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Response */}
              {summary.suggested_response && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Risposta Suggerita</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700 italic">{summary.suggested_response}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                Elaborato con {summary.model} • {new Date(summary.processed_at).toLocaleString('it-IT')}
              </div>
            </div>
          )}

          {/* Task Extraction View */}
          {!loading && !error && mode === 'extract-tasks' && taskResult && (
            <div className="space-y-6">
              {/* Tasks Found */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {taskResult.tasks_found} task {taskResult.tasks_found === 1 ? 'trovato' : 'trovati'}
                </h3>
                {taskResult.auto_created && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                    Task Creati
                  </span>
                )}
              </div>

              {/* Tasks List */}
              {taskResult.tasks.length > 0 ? (
                <div className="space-y-4">
                  {taskResult.tasks.map((task, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {task.due_date && (
                          <span>📅 Scadenza: {new Date(task.due_date).toLocaleDateString('it-IT')}</span>
                        )}
                        {task.estimated_hours && (
                          <span>⏱️ Stima: {task.estimated_hours}h</span>
                        )}
                        {task.assignee_suggestion && (
                          <span>👤 Suggerito: {task.assignee_suggestion}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nessun task operativo trovato in questa email
                </div>
              )}

              {/* Create Tasks Section */}
              {taskResult.tasks.length > 0 && !taskResult.auto_created && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <h4 className="font-medium text-gray-900">Crea Task nel Progetto</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="ID Progetto"
                      value={projectId || ''}
                      onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCreateTasks}
                      disabled={!projectId || loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <ListTodo className="w-4 h-4" />
                      <span>Crea {taskResult.tasks.length} Task</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                Elaborato con {taskResult.model} • {new Date(taskResult.processed_at).toLocaleString('it-IT')}
              </div>
            </div>
          )}

          {/* Smart Reply View */}
          {!loading && !error && mode === 'smart-reply' && reply && (
            <div className="space-y-6">
              {/* Tone Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Tono:</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-600">
                  {reply.tone === 'professional' && 'Professionale'}
                  {reply.tone === 'friendly' && 'Amichevole'}
                  {reply.tone === 'formal' && 'Formale'}
                </span>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Oggetto</h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900">{reply.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Messaggio</h3>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div
                    className="prose prose-sm max-w-none text-gray-900"
                    dangerouslySetInnerHTML={{ __html: reply.body.replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>

              {/* Use Reply Button */}
              <button
                onClick={handleUseReply}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Usa Questa Risposta</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
