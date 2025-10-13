import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, ExternalLink, Calendar, Users, MapPin, AlertTriangle } from 'lucide-react';
import { projectEventsAPI, ProjectEvent } from '../../api/projectEvents';

export const ProjectEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ProjectEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!id || isNaN(parseInt(id))) {
      navigate('/project-events');
      return;
    }

    try {
      const data = await projectEventsAPI.getById(parseInt(id));
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Caricamento...</div>;
  }

  if (!event) {
    return <div className="text-center py-12 text-red-600">Evento non trovato</div>;
  }

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
        {Array.isArray(value) ? (value.length > 0 ? value.join(', ') : '-') : (value || '-')}
      </div>
    </div>
  );

  const LinkField = ({ label, url, text }: { label: string; url: string | null; text: string | null }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-gray-50 p-3 rounded-lg"
        >
          <ExternalLink size={16} />
          {text || url}
        </a>
      ) : (
        <div className="text-gray-500 bg-gray-50 p-3 rounded-lg">-</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/project-events')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.progetto || 'Evento Senza Titolo'}</h1>
            <p className="text-gray-600 mt-1">Dettagli Evento</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/project-events/${event.id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit size={20} />
          Modifica
        </button>
      </div>

      {/* Alert if critical */}
      {event.critico && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <span className="font-semibold text-red-800">Evento Critico</span>
          </div>
          {event.motivo_criticita && (
            <p className="text-red-700 mt-2">{event.motivo_criticita}</p>
          )}
        </div>
      )}

      {/* Main Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni Principali</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Da Confermare" value={event.da_conf ? 'Sì' : 'No'} />
          <Field label="Data Inizio" value={event.data_inizio ? new Date(event.data_inizio).toLocaleDateString('it-IT') : '-'} />
          <Field label="Ora" value={event.ora} />
          <Field label="ECM" value={event.ecm ? 'Sì' : 'No'} />
          <Field label="Tipologia" value={event.tipologia} />
          <Field label="Progetto" value={event.progetto} />
          <Field label="Presa in Carico" value={event.presa_in_carico} />
          <Field label="Provider" value={event.provider} />
          <Field label="Referente Progetto" value={event.referente_progetto} />
          <Field label="Location" value={event.location} />
          <Field label="iPad" value={event.ipad} />
          <Field label="Piattaforma" value={event.piattaforma} />
          <Field label="Rimborso" value={event.rimborso} />
          <Field label="Rimborso Cliente" value={event.rimborso_cliente ? 'Sì' : 'No'} />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni Aggiuntive</h2>
        <Field label="Stato Informazioni" value={event.stato_informazioni} />
        <Field label="Logistica Tecnici" value={event.logistica_tecnici} />
      </div>

      {/* Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Link e Risorse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LinkField label="Landing Strutturata" url={event.landing_strutturata_url} text={event.landing_strutturata_text} />
          <LinkField label="Landing" url={event.landing_url} text={event.landing_text} />
          <LinkField label="Link Webinar" url={event.link_webinar_url} text={event.link_webinar_text} />
          <LinkField label="Drive" url={event.drive_url} text={event.drive_text} />
        </div>
      </div>
    </div>
  );
};
