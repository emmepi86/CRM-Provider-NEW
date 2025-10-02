import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Search } from 'lucide-react';
import { eventsAPI } from '../../api/events';
import { Event } from '../../types';

export const EventList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    event_type: '',
    status: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.list({
        search: filters.search || undefined,
        event_type: filters.event_type as any || undefined,
        status: filters.status as any || undefined,
      });
      setEvents(response.items);
    } catch (error) {
      console.error('Errore caricamento eventi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents();
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
    return type === 'ecm' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento eventi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Filtri</h2>
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Applica</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titolo evento..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.event_type}
              onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
            >
              <option value="">Tutti</option>
              <option value="ecm">ECM</option>
              <option value="non_ecm">Non ECM</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stato
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tutti</option>
              <option value="draft">Bozza</option>
              <option value="published">Pubblicato</option>
              <option value="cancelled">Cancellato</option>
              <option value="completed">Completato</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Eventi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="text-blue-600" size={20} />
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(event.event_type)}`}>
                  {event.event_type.toUpperCase()}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(event.status)}`}>
                {event.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {event.title}
            </h3>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Inizio:</span>{' '}
                {new Date(event.start_date).toLocaleDateString('it-IT')}
              </p>
              <p>
                <span className="font-medium">Fine:</span>{' '}
                {new Date(event.end_date).toLocaleDateString('it-IT')}
              </p>
              {event.location && (
                <p>
                  <span className="font-medium">Luogo:</span> {event.location}
                </p>
              )}
              {event.credits && (
                <p>
                  <span className="font-medium">Crediti:</span> {event.credits} ECM
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Nessun evento trovato</p>
        </div>
      )}
    </div>
  );
};
