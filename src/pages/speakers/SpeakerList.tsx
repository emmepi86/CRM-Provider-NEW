import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Search, Plus, Mail, Phone, Briefcase } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';
import { Speaker } from '../../types/speaker';
import { CreateSpeakerModal } from '../../components/speakers/CreateSpeakerModal';

export const SpeakerList: React.FC = () => {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSpeakers();
  }, [page, search, specialization]);

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      const data = await speakersAPI.list({
        search: search || undefined,
        specialization: specialization || undefined,
        page,
        page_size: 50,
      });
      setSpeakers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Errore caricamento relatori:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
    setPage(1);
  };

  const handleCreateSuccess = (speaker: Speaker) => {
    fetchSpeakers();
    navigate(`/speakers/${speaker.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mic className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Relatori</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Nuovo Relatore</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Filtra per specializzazione"
            value={specialization}
            onChange={(e) => handleSpecializationChange(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Caricamento...</p>
          </div>
        ) : speakers.length === 0 ? (
          <div className="text-center py-12">
            <Mic className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Nessun relatore trovato</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefono</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Specializzazione</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Creazione</th>
                  </tr>
                </thead>
                <tbody>
                  {speakers.map((speaker) => (
                    <tr
                      key={speaker.id}
                      onClick={() => navigate(`/speakers/${speaker.id}`)}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mic className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {speaker.first_name} {speaker.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail size={16} />
                          <span>{speaker.email || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone size={16} />
                          <span>{speaker.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Briefcase size={16} />
                          <span>{speaker.specialization || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(speaker.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Totale: {total} relatori
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Precedente
                </button>
                <span className="px-3 py-1">
                  Pagina {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={speakers.length < 50}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Successiva
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Speaker Modal */}
      {showCreateModal && (
        <CreateSpeakerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
