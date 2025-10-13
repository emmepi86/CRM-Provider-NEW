import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { projectEventsAPI, ProjectEventCreate } from '../../api/projectEvents';

const TIME_SLOTS = ['8', '8,30', '9', '9,30', '10', '10,30', '11', '11,30', '12', '12,30', '13', '13,30', '14', '14,30', '15', '15,30', '16', '16,30', '17', '17,30', '18', '18,30', '19', '19,30', '20', '20,30', '21', '21,30'];

const TIPOLOGIE = ['Residenziale', 'Webinar', 'Meeting', 'Interattivo', 'Webinar in presenza', 'FAD Asincrona', 'WebApp', 'Landing Strutturata', 'Sito', 'Digital Congress', 'Express Residenziale', 'DNALite Residenziale', 'DNALite', 'Break out', 'App no app Residenziale', 'Tavoli Interattivi', 'Medical Writer', 'Locazione ipad', 'Registrazione / Editing', 'Survey', 'Piattaforma raccolta dati', 'ALTRO(vedi stato info)*'];

const PRESA_IN_CARICO = ['Sorbino Alessandro', 'Paragnani Massimiliano', 'Lanzi Thomas', 'Erildo Zejnuni', 'Notarbartolo Riccardo', 'Menicocci', 'Zappatini', 'Ronchini', 'Altro'];

const PIATTAFORME = ['s.zappatini', 'a.sorbino', 'm.paragnani', 'Piattaforma Cliente'];

export const ProjectEventEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname.includes('/new');

  const [formData, setFormData] = useState<ProjectEventCreate>({
    da_conf: false,
    ecm: false,
    critico: false,
    rimborso_cliente: false,
    ora: [],
    tipologia: [],
    presa_in_carico: [],
    piattaforma: []
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isNew) {
      // If creating new, no need to load
      setLoading(false);
    } else if (id) {
      // If editing existing, fetch data
      fetchEvent();
    }
  }, [id, isNew]);

  const fetchEvent = async () => {
    try {
      const data = await projectEventsAPI.getById(parseInt(id!));
      setFormData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Errore nel caricamento dell\'evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isNew) {
        await projectEventsAPI.create(formData);
        alert('Evento creato con successo!');
      } else {
        await projectEventsAPI.update(parseInt(id!), formData);
        alert('Evento aggiornato con successo!');
      }
      navigate('/project-events');
    } catch (error) {
      console.error('Error:', error);
      alert('Errore nel salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return;
    try {
      await projectEventsAPI.delete(parseInt(id!));
      alert('Evento eliminato');
      navigate('/project-events');
    } catch (error) {
      console.error('Error:', error);
      alert('Errore nell\'eliminazione');
    }
  };

  const toggleArrayValue = (field: keyof ProjectEventCreate, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  if (loading) return <div className="text-center py-12">Caricamento...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/project-events')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Nuovo Evento' : 'Modifica Evento'}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Trash2 size={20} />
              Elimina
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Informazioni Base</h2>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.da_conf || false} onChange={e => setFormData({ ...formData, da_conf: e.target.checked })} className="rounded" />
              <span className="text-sm font-medium">Da Confermare</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
            <input type="date" value={formData.data_inizio || ''} onChange={e => setFormData({ ...formData, data_inizio: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ora</label>
            <div className="grid grid-cols-6 gap-2">
              {TIME_SLOTS.map(slot => (
                <label key={slot} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={(formData.ora || []).includes(slot)} onChange={() => toggleArrayValue('ora', slot)} className="rounded" />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ECM</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" checked={formData.ecm === true} onChange={() => setFormData({ ...formData, ecm: true })} />
                Sì
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={formData.ecm === false} onChange={() => setFormData({ ...formData, ecm: false })} />
                No
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipologia</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOLOGIE.map(tipo => (
                <label key={tipo} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(formData.tipologia || []).includes(tipo)} onChange={() => toggleArrayValue('tipologia', tipo)} className="rounded" />
                  {tipo}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Progetto</label>
            <input type="text" value={formData.progetto || ''} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Nome progetto" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Presa in Carico</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESA_IN_CARICO.map(persona => (
                <label key={persona} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(formData.presa_in_carico || []).includes(persona)} onChange={() => toggleArrayValue('presa_in_carico', persona)} className="rounded" />
                  {persona}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <input type="text" value={formData.provider || ''} onChange={e => setFormData({ ...formData, provider: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referente Progetto</label>
              <input type="text" value={formData.referente_progetto || ''} onChange={e => setFormData({ ...formData, referente_progetto: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">iPad</label>
              <input type="text" value={formData.ipad || ''} onChange={e => setFormData({ ...formData, ipad: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        {/* Criticality */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Criticità</h2>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.critico || false} onChange={e => setFormData({ ...formData, critico: e.target.checked })} className="rounded" />
              <span className="text-sm font-medium">Critico</span>
            </label>
          </div>

          {formData.critico && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo Criticità</label>
              <textarea value={formData.motivo_criticita || ''} onChange={e => setFormData({ ...formData, motivo_criticita: e.target.value })} rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="Descrivi il motivo della criticità..." />
            </div>
          )}
        </div>

        {/* Platform & Reimbursement */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Piattaforma e Rimborso</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Piattaforma</label>
            <div className="grid grid-cols-2 gap-2">
              {PIATTAFORME.map(plat => (
                <label key={plat} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(formData.piattaforma || []).includes(plat)} onChange={() => toggleArrayValue('piattaforma', plat)} className="rounded" />
                  {plat}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rimborso</label>
            <input type="text" value={formData.rimborso || ''} onChange={e => setFormData({ ...formData, rimborso: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="es: compreso nel preventivo" />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.rimborso_cliente || false} onChange={e => setFormData({ ...formData, rimborso_cliente: e.target.checked })} className="rounded" />
              <span className="text-sm font-medium">Rimborso/Cliente</span>
            </label>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Informazioni Aggiuntive</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Stato Informazioni</label>
            <textarea value={formData.stato_informazioni || ''} onChange={e => setFormData({ ...formData, stato_informazioni: e.target.value })} rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="es: confermata registrazione video, servono 2 persone" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logistica Tecnici</label>
            <input type="text" value={formData.logistica_tecnici || ''} onChange={e => setFormData({ ...formData, logistica_tecnici: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Link e Risorse</h2>

          {[
            { urlKey: 'landing_strutturata_url', textKey: 'landing_strutturata_text', label: 'Landing Strutturata' },
            { urlKey: 'landing_url', textKey: 'landing_text', label: 'Landing' },
            { urlKey: 'link_webinar_url', textKey: 'link_webinar_text', label: 'Link Webinar' },
            { urlKey: 'drive_url', textKey: 'drive_text', label: 'Drive' }
          ].map(({ urlKey, textKey, label }) => (
            <div key={urlKey} className="mb-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">{label}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Indirizzo web (es. http://...)</label>
                  <input type="url" value={(formData as any)[urlKey] || ''} onChange={e => setFormData({ ...formData, [urlKey]: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Testo da visualizzare</label>
                  <input type="text" value={(formData as any)[textKey] || ''} onChange={e => setFormData({ ...formData, [textKey]: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Testo link" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/project-events')} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Annulla
          </button>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save size={20} />
            {submitting ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  );
};
