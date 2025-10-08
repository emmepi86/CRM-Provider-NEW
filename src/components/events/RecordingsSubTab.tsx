import React, { useState, useEffect } from 'react';
import { Download, Clock, HardDrive, Video, AlertCircle } from 'lucide-react';
import { meetingsAPI, Meeting } from '../../api/meetings';

interface RecordingsSubTabProps {
  eventId: number;
}

export const RecordingsSubTab: React.FC<RecordingsSubTabProps> = ({ eventId }) => {
  const [recordings, setRecordings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [eventId]);

  const fetchRecordings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingsAPI.getRecordings(eventId);
      setRecordings(data);
    } catch (err: any) {
      setError('Errore nel caricamento registrazioni');
      console.error('Error loading recordings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (recording: Meeting) => {
    if (!recording.recording_path) return;

    // Extract filename from path
    const filename = recording.recording_path.split('/').pop() || 'recording.mp4';

    // Create download link
    const downloadUrl = `${window.location.origin}${recording.recording_path}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
        <div className="text-center">
          <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna Registrazione
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Le registrazioni dei meeting appariranno qui automaticamente al termine della sessione.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Nota:</strong> Le registrazioni vengono salvate automaticamente al termine del meeting.
            I file vengono organizzati per evento e includono data e ora della registrazione.
          </div>
        </div>
      </div>

      {/* Recordings list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Registrazioni ({recordings.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {recordings.map((recording) => (
            <div key={recording.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                {/* Recording info */}
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    {recording.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    {/* Date/Time */}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDateTime(recording.ended_at)}</span>
                    </div>

                    {/* File size */}
                    <div className="flex items-center">
                      <HardDrive className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatFileSize(recording.recording_size_bytes)}</span>
                    </div>

                    {/* Room name */}
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Room: {recording.room_name}</span>
                    </div>
                  </div>

                  {/* Recording path (for debug) */}
                  <div className="mt-2 text-xs text-gray-400">
                    <code>{recording.recording_path}</code>
                  </div>
                </div>

                {/* Download button */}
                <button
                  onClick={() => handleDownload(recording)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                  title="Scarica registrazione"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
