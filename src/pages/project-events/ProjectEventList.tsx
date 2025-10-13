import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { projectEventsAPI, ProjectEvent } from '../../api/projectEvents';

export const ProjectEventList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [page, search]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await projectEventsAPI.list({
        page,
        page_size: 50,
        search: search || undefined,
        sort_by: 'data_inizio',
        sort_order: 'desc'
      });
      setEvents(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return '-';
    return arr.join('; ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Eventi</h1>
          <p className="text-gray-600 mt-1">Gestione eventi interni e progetti</p>
        </div>
        <button
          onClick={() => navigate('/project-events/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuovo Evento
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca per progetto, location, provider..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Da Conf</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Inizio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ECM</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipologia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">Progetto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presa in carico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">iPad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Critico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px]">Motivo Criticità</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piattaforma</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rimborso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-gray-500">
                    Nessun evento trovato
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" checked={event.da_conf} disabled className="rounded" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(event.data_inizio)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatArray(event.ora)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{event.ecm ? 'Si' : 'No'}</td>
                    <td className="px-4 py-3 text-sm">{formatArray(event.tipologia)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.progetto || '-'}</td>
                    <td className="px-4 py-3 text-sm">{formatArray(event.presa_in_carico)}</td>
                    <td className="px-4 py-3 text-sm">{event.provider || '-'}</td>
                    <td className="px-4 py-3 text-sm">{event.referente_progetto || '-'}</td>
                    <td className="px-4 py-3 text-sm">{event.location || '-'}</td>
                    <td className="px-4 py-3 text-sm">{event.ipad || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {event.critico && <AlertTriangle size={18} className="text-red-500" />}
                    </td>
                    <td className="px-4 py-3 text-sm">{event.motivo_criticita || '-'}</td>
                    <td className="px-4 py-3 text-sm">{formatArray(event.piattaforma)}</td>
                    <td className="px-4 py-3 text-sm">{event.rimborso || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/project-events/${event.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                      >
                        Dettagli
                      </button>
                      <button
                        onClick={() => navigate(`/project-events/${event.id}/edit`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Modifica
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            <span className="text-sm text-gray-700">
              Pagina {page} di {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
