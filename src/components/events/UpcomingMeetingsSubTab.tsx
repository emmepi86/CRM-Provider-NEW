import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Edit2, ExternalLink, Plus, Video } from 'lucide-react';
import { meetingsAPI, Meeting } from '../../api/meetings';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { useAuth } from '../../hooks/useAuth';

interface UpcomingMeetingsSubTabProps {
  eventId: number;
}

export const UpcomingMeetingsSubTab: React.FC<UpcomingMeetingsSubTabProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, [eventId]);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingsAPI.getMeetingsList(eventId);
      setMeetings(data);
    } catch (err: any) {
      setError('Errore nel caricamento meeting');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId: number) => {
    if (!window.confirm('Eliminare questo meeting? L\'operazione non può essere annullata.')) {
      return;
    }

    try {
      await meetingsAPI.deleteById(meetingId);
      await fetchMeetings(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nell\'eliminazione del meeting');
      console.error('Error deleting meeting:', err);
    }
  };

  const handleJoinMeeting = async (meeting: Meeting) => {
    try {
      const tokenData = await meetingsAPI.getJoinToken(eventId);
      // Open Jitsi in new window
      const jitsiUrl = `${meeting.meeting_url}?jwt=${tokenData.token}`;
      window.open(jitsiUrl, '_blank', 'width=1280,height=720');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nel join del meeting');
      console.error('Error joining meeting:', err);
    }
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Non pianificato';
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Prossimi Meeting ({meetings.length})</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Meeting
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun Meeting Pianificato
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea un nuovo meeting virtuale per questo evento. Potrai pianificare data e ora.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crea Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                {/* Meeting info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{meeting.title}</h4>
                    {getStatusBadge(meeting.status)}
                  </div>

                  {meeting.description && (
                    <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {meeting.scheduled_at && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDateTime(meeting.scheduled_at)}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs">Room: {meeting.room_name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Entra</span>
                  </button>
                  <button
                    onClick={() => handleDelete(meeting.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Elimina meeting"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showCreateModal && (
        <ScheduleMeetingModal
          eventId={eventId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchMeetings}
        />
      )}
    </div>
  );
};
