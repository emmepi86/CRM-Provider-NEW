import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, FileText, Calendar, Plane, Mail, Phone, Briefcase, Trash2 } from 'lucide-react';
import { speakersAPI } from '../../api/speakers';
import { professionsAPI, Profession, Discipline } from '../../api/professions';
import { Speaker, SpeakerUpdate, TravelNeeds } from '../../types/speaker';
import { FolderBrowser } from '../../components/events/FolderBrowser';
import { SpeakerEventsList } from '../../components/speakers/SpeakerEventsList';

type TabType = 'info' | 'documents' | 'events' | 'travel';

export const SpeakerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(id === 'new');
  
  // Professioni e discipline
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<SpeakerUpdate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    notes: '',
    profession_id: undefined,
    discipline_id: undefined,
  });

  const [travelNeeds, setTravelNeeds] = useState<TravelNeeds>({
    hotel_required: false,
    flight_required: false,
    dietary_restrictions: '',
    special_requirements: '',
    notes: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchSpeaker(parseInt(id));
    }
  }, [id]);

  // Carica professioni all'avvio
  useEffect(() => {
    fetchProfessions();
  }, []);

  // Carica discipline quando arrivano i dati dello speaker
  useEffect(() => {
    if (speaker?.profession_id) {
      setSelectedProfessionId(speaker.profession_id);
      handleProfessionChange(speaker.profession_id);
    }
  }, [speaker]);

  const fetchSpeaker = async (speakerId: number) => {
    try {
      setLoading(true);
      const data = await speakersAPI.getById(speakerId);
      setSpeaker(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        notes: data.notes || '',
        profession_id: data.profession_id ?? undefined,
        discipline_id: data.discipline_id ?? undefined,
      });
      setTravelNeeds(data.travel_needs || {});
    } catch (error) {
      console.error('Errore caricamento relatore:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const data = await professionsAPI.list();
      setProfessions(data);
    } catch (error) {
      console.error('Errore caricamento professioni:', error);
    }
  };

  const handleProfessionChange = async (professionId: number | null) => {
    setSelectedProfessionId(professionId);
    setFormData({ 
      ...formData, 
      profession_id: professionId || undefined,
      discipline_id: undefined
    });
    
    if (professionId) {
      try {
        const data = await professionsAPI.getDisciplines(professionId);
        setDisciplines(data);
      } catch (error) {
        console.error('Errore caricamento discipline:', error);
        setDisciplines([]);
      }
    } else {
      setDisciplines([]);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      alert('Nome e cognome sono obbligatori');
      return;
    }

    try {
      setSaving(true);

      if (id === 'new') {
        const createData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          notes: formData.notes,
          profession_id: selectedProfessionId || undefined,
          discipline_id: formData.discipline_id,
          travel_needs: travelNeeds,
          documents: [],
        };
        const newSpeaker = await speakersAPI.create(createData);
        navigate(`/speakers/${newSpeaker.id}`);
      } else {
        const updated = await speakersAPI.update(parseInt(id!), {
          ...formData,
          profession_id: selectedProfessionId || undefined,
          travel_needs: travelNeeds,
        });
        setSpeaker(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Errore salvataggio relatore:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo relatore?')) {
      return;
    }

    try {
      await speakersAPI.delete(parseInt(id!));
      navigate('/speakers');
    } catch (error) {
      console.error('Errore eliminazione relatore:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  if (loading && id !== 'new') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    );
  }

  const isNew = id === 'new';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/speakers')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nuovo Relatore' : `${speaker?.first_name} ${speaker?.last_name}`}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isNew && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifica
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          {(isEditing || isNew) && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? 'Salvataggio...' : 'Salva'}</span>
              </button>
              {!isNew && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchSpeaker(parseInt(id!));
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annulla
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={18} />
                <span>Anagrafica</span>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={18} />
                <span>Documenti</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar size={18} />
                <span>Eventi</span>
              </button>
              <button
                onClick={() => setActiveTab('travel')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'travel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plane size={18} />
                <span>Esigenze Viaggio</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      disabled={!isEditing && !isNew}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cognome *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      disabled={!isEditing && !isNew}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing && !isNew}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Telefono
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing && !isNew}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="inline mr-2" size={16} />
                      Professione
                    </label>
                    <select
                      value={selectedProfessionId || ''}
                      onChange={(e) => handleProfessionChange(e.target.value ? parseInt(e.target.value) : null)}
                      disabled={!isEditing && !isNew}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">-- Seleziona professione --</option>
                      {professions.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disciplina
                    </label>
                    <select
                      value={formData.discipline_id || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discipline_id: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      disabled={!isEditing && !isNew || !selectedProfessionId}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">-- Seleziona disciplina --</option>
                      {disciplines.map((disc) => (
                        <option key={disc.id} value={disc.id}>
                          {disc.name}
                        </option>
                      ))}
                    </select>
                    {!selectedProfessionId && (isEditing || isNew) && (
                      <p className="text-sm text-gray-500 mt-1">Seleziona prima una professione</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing && !isNew}
                    rows={4}
                    placeholder="Breve biografia del relatore..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={!isEditing && !isNew}
                    rows={3}
                    placeholder="Note interne..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            )}

            {activeTab === 'documents' && speaker && (
              <FolderBrowser entityType="speaker" entityId={speaker.id} />
            )}

            {activeTab === 'events' && speaker && (
              <SpeakerEventsList speakerId={speaker.id} />
            )}

            {activeTab === 'travel' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={travelNeeds.hotel_required || false}
                      onChange={(e) => setTravelNeeds({ ...travelNeeds, hotel_required: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <span>Hotel necessario</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={travelNeeds.flight_required || false}
                      onChange={(e) => setTravelNeeds({ ...travelNeeds, flight_required: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <span>Volo necessario</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrizioni Alimentari
                  </label>
                  <input
                    type="text"
                    value={travelNeeds.dietary_restrictions || ''}
                    onChange={(e) => setTravelNeeds({ ...travelNeeds, dietary_restrictions: e.target.value })}
                    disabled={!isEditing}
                    placeholder="es. Vegetariano, celiaco..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisiti Speciali
                  </label>
                  <textarea
                    value={travelNeeds.special_requirements || ''}
                    onChange={(e) => setTravelNeeds({ ...travelNeeds, special_requirements: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Necessità particolari per il viaggio..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Viaggio
                  </label>
                  <textarea
                    value={travelNeeds.notes || ''}
                    onChange={(e) => setTravelNeeds({ ...travelNeeds, notes: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Note aggiuntive..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isNew && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cognome *
                </label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professione
                </label>
                <select
                  value={selectedProfessionId || ''}
                  onChange={(e) => handleProfessionChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona professione --</option>
                  {professions.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplina
                </label>
                <select
                  value={formData.discipline_id || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    discipline_id: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  disabled={!selectedProfessionId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">-- Seleziona disciplina --</option>
                  {disciplines.map((disc) => (
                    <option key={disc.id} value={disc.id}>
                      {disc.name}
                    </option>
                  ))}
                </select>
                {!selectedProfessionId && (
                  <p className="text-sm text-gray-500 mt-1">Seleziona prima una professione</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Breve biografia del relatore..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
