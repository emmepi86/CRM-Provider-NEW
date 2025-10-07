import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Plane, Hotel, ExternalLink } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';

interface SpeakerEvent {
  id: number;
  event_id: number;
  role: string;
  session_title?: string;
  session_datetime?: string;
  honorarium?: number;
  travel_booked: boolean;
  accommodation_booked: boolean;
  notes?: string;
  event: {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    event_type: string;
    status: string;
  };
}

interface SpeakerEventsListProps {
  speakerId: number;
}

export const SpeakerEventsList: React.FC<SpeakerEventsListProps> = ({ speakerId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SpeakerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [speakerId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await speakersAPI.listSpeakerEvents(speakerId);
      setEvents(data.events);
    } catch (error) {
      console.error('Errore caricamento eventi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    return type === 'ecm' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      speaker: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800',
      keynote: 'bg-yellow-100 text-yellow-800',
      panelist: 'bg-purple-100 text-purple-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <p className="text-center py-8 text-gray-500">Caricamento eventi...</p>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
        <p>Nessun evento associato a questo relatore</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((se) => (
        <div key={se.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{se.event.title}</h3>
                <button
                  onClick={() => navigate(`/events/${se.event_id}`)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Vai all'evento"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(se.event.event_type)}`}>
                  {se.event.event_type === 'ecm' ? 'ECM' : 'Non-ECM'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(se.event.status)}`}>
                  {se.event.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(se.role)}`}>
                  {se.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2" size={16} />
              <span>
                {new Date(se.event.start_date).toLocaleDateString('it-IT')}
                {se.event.end_date !== se.event.start_date && 
                  ` - ${new Date(se.event.end_date).toLocaleDateString('it-IT')}`}
              </span>
            </div>

            {se.event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="mr-2" size={16} />
                <span>{se.event.location}</span>
              </div>
            )}
          </div>

          {se.session_title && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Sessione:</span> {se.session_title}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-6 text-sm">
            {se.honorarium && (
              <div className="flex items-center text-green-600">
                <DollarSign size={16} className="mr-1" />
                <span className="font-medium">€{se.honorarium}</span>
              </div>
            )}

            {se.travel_booked && (
              <div className="flex items-center text-blue-600">
                <Plane size={16} className="mr-1" />
                <span>Viaggio prenotato</span>
              </div>
            )}

            {se.accommodation_booked && (
              <div className="flex items-center text-purple-600">
                <Hotel size={16} className="mr-1" />
                <span>Alloggio prenotato</span>
              </div>
            )}
          </div>

          {se.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Note:</span> {se.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
