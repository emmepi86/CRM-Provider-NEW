import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Users, Trash2, Edit, Video, Plus, Calendar, Wand2 } from 'lucide-react';
import { sessionsAPI } from '../../api/sessions';
import { EventSession } from '../../types';
import { SessionForm } from './SessionForm';
import { ProgramGenerator } from './ProgramGenerator';

interface SessionListProps {
  eventId: number;
  onSessionClick?: (session: EventSession) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ eventId, onSessionClick }) => {
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingSession, setEditingSession] = useState<EventSession | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [eventId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.listByEvent(eventId);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Errore caricamento sessioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa sessione?')) {
      return;
    }

    try {
      await sessionsAPI.delete(eventId, sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Errore eliminazione sessione:', error);
      alert('Errore durante l\'eliminazione della sessione');
    }
  };

  const handleEdit = (session: EventSession) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  const handleFormSuccess = () => {
    fetchSessions();
    handleCloseForm();
  };

  const handleGeneratorSuccess = () => {
    fetchSessions();
    setShowGenerator(false);
  };

  const getSessionTypeColor = (type: string) => {
    const colors = {
      LECTURE: 'bg-blue-100 text-blue-800',
      WORKSHOP: 'bg-purple-100 text-purple-800',
      BREAK: 'bg-gray-100 text-gray-800',
      LUNCH: 'bg-orange-100 text-orange-800',
      REGISTRATION: 'bg-green-100 text-green-800',
      OTHER: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      LECTURE: 'Lezione',
      WORKSHOP: 'Workshop',
      BREAK: 'Pausa',
      LUNCH: 'Pranzo',
      REGISTRATION: 'Registrazione',
      OTHER: 'Altro',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: EventSession[] } = {};
    sessions.forEach(session => {
      const date = session.session_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-8">Caricamento sessioni...</p>;
  }

  const groupedSessions = groupSessionsByDate();
  const dates = Object.keys(groupedSessions).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sessioni Programmate ({sessions.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestisci il programma dettagliato dell'evento
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Wand2 size={18} />
            <span>Genera Programma</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Nuova Sessione</span>
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Nessuna sessione programmata</p>
          <p className="text-sm text-gray-500 mb-4">
            Crea manualmente le sessioni o genera automaticamente un programma
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowGenerator(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Wand2 size={18} />
              <span>Genera Programma</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crea Manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => (
            <div key={date} className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
              </div>

              <div className="divide-y divide-gray-200">
                {groupedSessions[date].map((session) => (
                  <div
                    key={session.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-1" />
                            <span className="text-sm font-medium">
                              {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.session_type)}`}>
                            {getSessionTypeLabel(session.session_type)}
                          </span>
                          {session.requires_attendance && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Presenze
                            </span>
                          )}
                        </div>

                        <h5 className="text-base font-semibold text-gray-900 mb-1">
                          {session.title}
                        </h5>

                        {session.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {session.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {session.speaker_name && (
                            <span>👤 {session.speaker_name}</span>
                          )}
                          {(session as any).room_name && (
                            <span className="flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {(session as any).room_name}
                            </span>
                          )}
                          {session.is_online && (
                            <span className="flex items-center">
                              <Video size={14} className="mr-1" />
                              Online
                            </span>
                          )}
                          {session.max_capacity && (
                            <span className="flex items-center">
                              <Users size={14} className="mr-1" />
                              Max {session.max_capacity}
                            </span>
                          )}
                          {session.ecm_credits && (
                            <span className="font-medium text-purple-600">
                              {session.ecm_credits} crediti ECM
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifica"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SessionForm
          eventId={eventId}
          session={editingSession}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {showGenerator && (
        <ProgramGenerator
          eventId={eventId}
          onClose={() => setShowGenerator(false)}
          onSuccess={handleGeneratorSuccess}
        />
      )}
    </div>
  );
};
