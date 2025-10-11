import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointerClick,
  Eye,
  Edit,
  ExternalLink,
  Plus,
  Copy,
  TrendingUp,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import { landingPagesAdminAPI } from '../../api/landingPagesAdmin';
import type { LandingPage } from '../../types/landing';

interface LandingTabProps {
  eventId: number;
}

export const LandingTab: React.FC<LandingTabProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLandingPage();
  }, [eventId]);

  const fetchLandingPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await landingPagesAdminAPI.getByEvent(eventId);
      setLandingPage(page);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Nessuna landing page per questo evento
        setLandingPage(null);
      } else {
        setError('Errore nel caricamento della landing page');
        console.error('Error fetching landing page:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(url);
    alert('URL copiato negli appunti!');
  };

  const getConversionRate = (): string => {
    if (!landingPage || landingPage.total_views === 0) return '0%';
    return ((landingPage.total_submissions / landingPage.total_views) * 100).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!landingPage) {
    // Empty state - Nessuna landing page
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <MousePointerClick className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nessuna Landing Page
          </h3>
          <p className="text-gray-600 mb-6">
            Crea una landing page pubblica per questo evento per raccogliere iscrizioni in modo autonomo.
            Gli iscritti dalla landing page appariranno automaticamente nel tab "Iscritti".
          </p>
          <button
            onClick={() => navigate(`/landing-pages/new?event_id=${eventId}`)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crea Landing Page</span>
          </button>
        </div>
      </div>
    );
  }

  // Landing page esistente
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{landingPage.title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {landingPage.subtitle || 'Landing page per raccogliere iscrizioni pubbliche'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`/landing/${landingPage.slug}`, '_blank')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Visualizza landing page pubblica"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visualizza</span>
          </button>
          <button
            onClick={() => handleCopyUrl(landingPage.slug)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copia URL pubblico"
          >
            <Copy className="w-4 h-4" />
            <span>Copia URL</span>
          </button>
          <button
            onClick={() => navigate(`/landing-pages/${landingPage.id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Modifica landing page"
          >
            <Edit className="w-4 h-4" />
            <span>Modifica</span>
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visualizzazioni</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {landingPage.total_views}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Iscrizioni</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {landingPage.total_submissions}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UsersIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Visibili nel tab "Iscritti"
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {getConversionRate()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${parseFloat(getConversionRate()) > 20 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <TrendingUp className={`w-8 h-8 ${parseFloat(getConversionRate()) > 20 ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Landing Page</h3>
        <div className="flex items-center space-x-4">
          {landingPage.is_published ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Pubblicata
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              ○ Bozza
            </span>
          )}

          {landingPage.is_active ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ✓ Attiva
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              ○ Disattivata
            </span>
          )}

          {landingPage.requires_payment && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              💳 Pagamento: €{landingPage.amount?.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* URL Pubblico */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">URL Pubblico</h3>
        <div className="flex items-center space-x-3">
          <code className="flex-1 bg-white px-4 py-3 rounded-lg text-sm font-mono text-gray-800 border border-blue-200">
            {window.location.origin}/landing/{landingPage.slug}
          </code>
          <button
            onClick={() => handleCopyUrl(landingPage.slug)}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copia</span>
          </button>
        </div>
        <p className="text-sm text-blue-700 mt-3">
          Condividi questo link con i partecipanti per permettere loro di iscriversi in autonomia.
          Le iscrizioni appariranno automaticamente nel tab "Iscritti" di questo evento.
        </p>
      </div>

      {/* Form Fields Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campi del Form</h3>
        <div className="space-y-2">
          {landingPage.form_fields
            .sort((a, b) => a.order_index - b.order_index)
            .map((field) => (
              <div key={field.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{field.label}</span>
                  {field.required && (
                    <span className="text-xs font-medium text-red-600">* Obbligatorio</span>
                  )}
                  {field.maps_to_participant_field && (
                    <span className="text-xs font-medium text-blue-600">
                      → {field.maps_to_participant_field}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 capitalize">{field.field_type}</span>
              </div>
            ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Totale campi: {landingPage.form_fields.length}
        </p>
      </div>
    </div>
  );
};
