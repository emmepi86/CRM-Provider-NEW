import React, { useEffect, useState } from 'react';
import { syncAPI, SyncStats, SyncLog } from '../../api/sync';
import { RefreshCw, Activity, CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const SyncDashboard: React.FC = () => {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 5s when syncing
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
      const [statsData, logsData] = await Promise.all([
        syncAPI.getStats(),
        syncAPI.getSyncLogs({ page: 1, page_size: 10 }),
      ]);
      setStats(statsData);
      setLogs(logsData.items);

      // Check if there are running jobs
      const hasRunning = logsData.items.some(log => log.status === 'running');
      setAutoRefresh(hasRunning);
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: 'courses' | 'enrollments' | 'ecm' | 'all') => {
    try {
      setSyncing(type);
      setAutoRefresh(true);

      if (type === 'courses') {
        await syncAPI.triggerSyncCourses();
      } else if (type === 'enrollments') {
        await syncAPI.triggerSyncEnrollments();
      } else if (type === 'ecm') {
        await syncAPI.triggerSyncECM();
      } else {
        await syncAPI.triggerSyncAll();
      }

      // Wait a bit then reload
      setTimeout(() => {
        loadData();
        setSyncing(null);
      }, 2000);
    } catch (error) {
      console.error('Error triggering sync:', error);
      alert('Errore durante l\'avvio della sincronizzazione');
      setSyncing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'partial':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'running':
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatJobType = (jobType: string) => {
    const names: { [key: string]: string } = {
      sync_courses: 'Corsi',
      sync_enrollments: 'Iscrizioni',
      sync_ecm_status: 'Stato ECM',
    };
    return names[jobType] || jobType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Activity size={28} />
            <span>Sincronizzazione Moodle</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Gestisci la sincronizzazione dei dati da Moodle
          </p>
        </div>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2"
          disabled={syncing !== null}
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          <span>Aggiorna</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Sync</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_syncs}</p>
              </div>
              <Activity className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successi</p>
                <p className="text-3xl font-bold text-green-600">{stats.successful_syncs}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errori</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed_syncs}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Record Processati</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total_records_processed}</p>
              </div>
              <Activity className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Trigger Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sincronizzazione Manuale</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleSync('courses')}
            disabled={syncing !== null}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {syncing === 'courses' && <RefreshCw size={18} className="animate-spin" />}
            <span>Sync Corsi</span>
          </button>

          <button
            onClick={() => handleSync('enrollments')}
            disabled={syncing !== null}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {syncing === 'enrollments' && <RefreshCw size={18} className="animate-spin" />}
            <span>Sync Iscrizioni</span>
          </button>

          <button
            onClick={() => handleSync('ecm')}
            disabled={syncing !== null}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {syncing === 'ecm' && <RefreshCw size={18} className="animate-spin" />}
            <span>Sync ECM</span>
          </button>

          <button
            onClick={() => handleSync('all')}
            disabled={syncing !== null}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {syncing === 'all' && <RefreshCw size={18} className="animate-spin" />}
            <span>Sync Completo</span>
          </button>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Recenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Record</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Errori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Durata</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Inizio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Nessun log di sincronizzazione
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="py-3 px-4">
                        {expandedLogId === log.id ? (
                          <ChevronUp size={18} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-600" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{formatJobType(log.job_type)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusBadge(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{log.records_processed}</td>
                      <td className="py-3 px-4">
                        {log.errors_count > 0 ? (
                          <span className="text-red-600 font-medium">{log.errors_count}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDuration(log.duration_seconds)}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(log.started_at).toLocaleString('it-IT')}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {log.completed_at ? new Date(log.completed_at).toLocaleString('it-IT') : (
                          <span className="flex items-center space-x-1 text-blue-600">
                            <Clock size={14} />
                            <span>In corso...</span>
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedLogId === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="space-y-4">
                            {/* Summary Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">ID Sincronizzazione</p>
                                <p className="text-sm font-mono text-gray-900">#{log.id}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Tenant ID</p>
                                <p className="text-sm font-mono text-gray-900">{log.tenant_id}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Job Type</p>
                                <p className="text-sm font-mono text-gray-900">{log.job_type}</p>
                              </div>
                            </div>

                            {/* Error Details */}
                            {log.error_details && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                  <AlertTriangle size={20} className="text-red-600" />
                                  <h3 className="font-semibold text-red-900">Dettagli Errori</h3>
                                </div>

                                {/* Single Error */}
                                {log.error_details.error && (
                                  <div className="bg-white rounded p-3 border border-red-300">
                                    <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">
                                      {log.error_details.error}
                                    </p>
                                  </div>
                                )}

                                {/* Multiple Errors */}
                                {log.error_details.errors && log.error_details.errors.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-red-800 font-medium">
                                      {log.error_details.errors.length} errore/i trovato/i:
                                    </p>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                      {log.error_details.errors.map((error, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white rounded p-3 border border-red-300"
                                        >
                                          <p className="text-xs text-gray-600 mb-1">Errore #{idx + 1}</p>
                                          <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">
                                            {error}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Success Message */}
                            {!log.error_details && log.status === 'success' && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle2 size={20} className="text-green-600" />
                                  <p className="text-green-800 font-medium">
                                    Sincronizzazione completata con successo! {log.records_processed} record processati.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Partial Success */}
                            {log.status === 'partial' && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle size={20} className="text-yellow-600" />
                                  <p className="text-yellow-800 font-medium">
                                    Sincronizzazione parziale: {log.records_processed} record processati, {log.errors_count} errori.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Running Status */}
                            {log.status === 'running' && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                  <RefreshCw size={20} className="text-blue-600 animate-spin" />
                                  <p className="text-blue-800 font-medium">
                                    Sincronizzazione in corso...
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
