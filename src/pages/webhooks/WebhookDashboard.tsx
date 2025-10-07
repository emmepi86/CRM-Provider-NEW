import React, { useEffect, useState } from 'react';
import { webhooksAPI, WebhookLog } from '../../api/webhooks';
import { Webhook, CheckCircle2, XCircle, AlertCircle, Clock, Copy, RefreshCw, Filter } from 'lucide-react';

export const WebhookDashboard: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [filterEventType, setFilterEventType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
    loadWebhookInfo();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      const params: any = { limit: 50 };
      if (filterEventType) params.event_type = filterEventType;
      if (filterStatus) params.status = filterStatus;

      const data = await webhooksAPI.getWebhookLogs(params);
      setLogs(data.logs);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookInfo = async () => {
    try {
      const info = await webhooksAPI.getWebhookInfo();
      setWebhookInfo(info);
    } catch (error) {
      console.error('Error loading webhook info:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterEventType, filterStatus]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-orange-100 text-orange-800 border-orange-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'rejected':
        return <AlertCircle size={16} className="text-orange-600" />;
      case 'processing':
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const eventTypes = [
    { value: '', label: 'Tutti i tipi' },
    { value: 'enrollment_created', label: 'Iscrizione creata' },
    { value: 'enrollment_completed', label: 'Corso completato' },
    { value: 'course_updated', label: 'Corso aggiornato' },
    { value: 'activity_completed', label: 'Attività completata' },
  ];

  const statuses = [
    { value: '', label: 'Tutti gli stati' },
    { value: 'completed', label: 'Completato' },
    { value: 'processing', label: 'In elaborazione' },
    { value: 'failed', label: 'Fallito' },
    { value: 'rejected', label: 'Rifiutato' },
    { value: 'pending', label: 'In attesa' },
  ];

  if (loading && !webhookInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Webhook size={32} />
          Configurazione Webhook Moodle
        </h1>
        <p className="text-gray-600 mt-2">
          Configura webhook per ricevere notifiche in tempo reale da Moodle
        </p>
      </div>

      {/* Webhook URLs Section */}
      {webhookInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Webhook size={20} />
            URL Webhook per Moodle
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Configura questi URL in Moodle: <strong>Site Administration → Plugins → Web services → External services</strong>
          </p>

          <div className="space-y-3">
            {Object.entries(webhookInfo.endpoints).map(([key, url]: [string, any]) => (
              <div key={key} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <code className="text-xs text-gray-600 break-all">{url}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(url, key)}
                    className="ml-4 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    {copiedUrl === key ? (
                      <>
                        <CheckCircle2 size={16} />
                        Copiato!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copia
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">⚙️ Configurazione Moodle</h3>
            <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
              <li>Vai su <strong>Site Administration → Plugins → Web services</strong></li>
              <li>Crea un nuovo servizio esterno chiamato "CRM Webhooks"</li>
              <li>Aggiungi le funzioni necessarie per gli eventi</li>
              <li>Configura gli URL webhook sopra per ogni tipo di evento</li>
              <li>Imposta l'header <code>X-Tenant-ID: 1</code> nelle richieste</li>
              <li>Configura il segreto HMAC (vedi documentazione backend)</li>
            </ol>
          </div>
        </div>
      )}

      {/* Webhook Logs Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock size={20} />
            Log Webhook Ricevuti
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (5s)
            </label>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Aggiorna
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter size={14} className="inline mr-1" />
              Tipo evento
            </label>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter size={14} className="inline mr-1" />
              Stato
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Webhook size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nessun webhook ricevuto ancora</p>
            <p className="text-sm mt-2">Configura i webhook in Moodle per iniziare a ricevere notifiche</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ricevuto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Elaborato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errore
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{log.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-gray-900">{log.event_type}</span>
                      {log.payload?.courseid && (
                        <div className="text-xs text-gray-500">Corso ID: {log.payload.courseid}</div>
                      )}
                      {log.payload?.userid && (
                        <div className="text-xs text-gray-500">Utente ID: {log.payload.userid}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(log.received_at).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.processed_at ? new Date(log.processed_at).toLocaleString('it-IT') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.error_message ? (
                        <span className="text-red-600 text-xs" title={log.error_message}>
                          {log.error_message.substring(0, 50)}
                          {log.error_message.length > 50 && '...'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Visualizzati {logs.length} webhook ricevuti
          </div>
        )}
      </div>
    </div>
  );
};
