import React, { useState, useEffect } from 'react';
import { Video, Trash2, Copy, Check, ExternalLink, Clock, Edit2, Film, Calendar } from 'lucide-react';
import { meetingsAPI, Meeting } from '../../api/meetings';
import { DraggableJitsiModal } from '../meetings/DraggableJitsiModal';
import { RecordingsSubTab } from './RecordingsSubTab';
import { UpcomingMeetingsSubTab } from './UpcomingMeetingsSubTab';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { useAuth } from '../../hooks/useAuth';

interface MeetingTabProps {
  eventId: number;
}

type SubTab = 'upcoming' | 'active' | 'recordings';

export const MeetingTab: React.FC<MeetingTabProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('upcoming');
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJitsiModal, setShowJitsiModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  // Load meeting data
  useEffect(() => {
    fetchMeeting();
  }, [eventId]);

  const fetchMeeting = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get only active/scheduled meetings (not ended)
      const meetings = await meetingsAPI.getMeetingsList(eventId);

      // Get the first active or scheduled meeting for the "Meeting Attivo" tab
      const activeMeeting = meetings.find(m => m.status === 'active' || m.status === 'scheduled');
      setMeeting(activeMeeting || null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMeeting(null);
      } else {
        setError('Errore nel caricamento meeting');
        console.error('Error loading meeting:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    // Open schedule modal instead of prompt
    setShowScheduleModal(true);
  };

  const handleMeetingCreated = async () => {
    // Refresh meeting data after successful creation
    await fetchMeeting();
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm('Eliminare il meeting? I partecipanti non potranno più accedere.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await meetingsAPI.delete(eventId);
      setMeeting(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nell\'eliminazione meeting');
      console.error('Error deleting meeting:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (meeting) {
      navigator.clipboard.writeText(meeting.meeting_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditTitle = async () => {
    if (!meeting) return;

    const newTitle = window.prompt('Modifica il titolo del meeting:', meeting.title);

    if (!newTitle || newTitle.trim() === '' || newTitle === meeting.title) {
      return; // User cancelled or no change
    }

    setEditingTitle(true);
    setError(null);
    try {
      const updatedMeeting = await meetingsAPI.updateTitle(eventId, newTitle.trim());
      setMeeting(updatedMeeting);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nella modifica del titolo');
      console.error('Error updating title:', err);
    } finally {
      setEditingTitle(false);
    }
  };

  const handleJoinMeeting = async () => {
    setLoadingToken(true);
    setError(null);
    try {
      const tokenData = await meetingsAPI.getJoinToken(eventId);
      setJwtToken(tokenData.token);
      setShowJitsiModal(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nel recupero token di accesso');
      console.error('Error fetching join token:', err);
    } finally {
      setLoadingToken(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { label: 'Programmato', className: 'bg-blue-100 text-blue-800' },
      active: { label: 'In corso', className: 'bg-green-100 text-green-800' },
      ended: { label: 'Terminato', className: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('upcoming')}
            className={`${
              activeSubTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Prossimi Meeting
          </button>
          <button
            onClick={() => setActiveSubTab('active')}
            className={`${
              activeSubTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Video className="w-4 h-4 mr-2" />
            Meeting Attivo
          </button>
          <button
            onClick={() => setActiveSubTab('recordings')}
              className={`${
                activeSubTab === 'recordings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Film className="w-4 h-4 mr-2" />
              Registrazioni
            </button>
          </nav>
        </div>

      {/* Upcoming meetings sub-tab */}
      {activeSubTab === 'upcoming' && (
        <UpcomingMeetingsSubTab eventId={eventId} />
      )}

      {/* Active meeting sub-tab */}
      {activeSubTab === 'active' && (
        <>
          {!meeting ? (
        // No meeting created yet
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
          <div className="text-center">
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun Meeting Virtuale
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea un meeting virtuale per permettere ai partecipanti di collegarsi online.
              Sarà possibile condividere il link di accesso.
            </p>
            <button
              onClick={handleCreateMeeting}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Video className="w-5 h-5 mr-2" />
              Pianifica Meeting Virtuale
            </button>
          </div>
        </div>
      ) : (
        // Meeting exists
        <div className="space-y-6">
          {/* Meeting Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-start space-x-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {meeting.title}
                  </h3>
                  <button
                    onClick={handleEditTitle}
                    disabled={editingTitle}
                    className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    title="Modifica titolo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">Room: {meeting.room_name}</p>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(meeting.status)}
                  {meeting.started_at && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Iniziato: {new Date(meeting.started_at).toLocaleString('it-IT')}
                    </span>
                  )}
                </div>
                {meeting.recording_path && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      📹 Registrazione disponibile
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {meeting.recording_size_bytes
                        ? `Dimensione: ${(meeting.recording_size_bytes / 1024 / 1024).toFixed(2)} MB`
                        : 'File salvato'}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleDeleteMeeting}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
                title="Elimina meeting"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Meeting URL */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Meeting
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={meeting.meeting_url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 text-sm"
                  title="Copia link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copia</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Condividi questo link con i partecipanti all'evento
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleJoinMeeting}
                disabled={loadingToken}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>{loadingToken ? 'Caricamento...' : 'Entra nel Meeting'}</span>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informazioni</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Il meeting è ospitato su Jitsi (server pubblico o dedicato)</li>
              <li>• Non serve registrazione: basta cliccare sul link</li>
              <li>• Supporta video, audio, screen sharing e chat</li>
              <li>• Funziona su browser, nessuna app richiesta</li>
            </ul>
          </div>
        </div>
          )}
        </>
      )}

      {/* Recordings sub-tab */}
      {activeSubTab === 'recordings' && (
        <RecordingsSubTab eventId={eventId} />
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <ScheduleMeetingModal
          eventId={eventId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleMeetingCreated}
        />
      )}

      {/* Draggable Jitsi Modal */}
      {showJitsiModal && meeting && jwtToken && (
        <div id="jitsi-modal-container" className="fixed inset-0 z-40" style={{ pointerEvents: 'none' }}>
          <DraggableJitsiModal
            roomName={meeting.room_name}
            meetingUrl={meeting.meeting_url}
            displayName={user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Utente'}
            jwtToken={jwtToken}
            onClose={() => {
              setShowJitsiModal(false);
              setJwtToken(null); // Clear token to force fresh fetch on next join
            }}
          />
        </div>
      )}
    </div>
  );
};
