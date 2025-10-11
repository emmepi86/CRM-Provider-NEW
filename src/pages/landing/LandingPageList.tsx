import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  TrendingUp,
  Users,
  MousePointerClick
} from 'lucide-react';
import { landingPagesAdminAPI } from '../../api/landingPagesAdmin';
import type { LandingPage } from '../../types/landing';

export const LandingPageList: React.FC = () => {
  const navigate = useNavigate();
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    setLoading(true);
    try {
      const data = await landingPagesAdminAPI.list();
      setLandingPages(data);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      alert('Errore nel caricamento delle landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare "${title}"?`)) {
      return;
    }

    try {
      await landingPagesAdminAPI.delete(id);
      alert('Landing page eliminata con successo');
      fetchLandingPages();
    } catch (error) {
      console.error('Error deleting landing page:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(url);
    alert('URL copiato negli appunti!');
  };

  const getConversionRate = (page: LandingPage): string => {
    if (page.total_views === 0) return '0%';
    return ((page.total_submissions / page.total_views) * 100).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le landing pages per gli eventi residenziali
          </p>
        </div>
        <button
          onClick={() => navigate('/landing-pages/new')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuova Landing Page</span>
        </button>
      </div>

      {/* Stats Cards */}
      {landingPages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Landing Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {landingPages.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MousePointerClick className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visualizzazioni Totali</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {landingPages.reduce((sum, p) => sum + p.total_views, 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Iscrizioni Totali</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {landingPages.reduce((sum, p) => sum + p.total_submissions, 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Landing Pages Table */}
      {landingPages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MousePointerClick className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nessuna Landing Page
          </h3>
          <p className="text-gray-600 mb-6">
            Crea la tua prima landing page per iniziare a raccogliere iscrizioni
          </p>
          <button
            onClick={() => navigate('/landing-pages/new')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crea Landing Page</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Landing Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {landingPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{page.title}</div>
                      {page.subtitle && (
                        <div className="text-sm text-gray-500 mt-1">{page.subtitle}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">/{page.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {page.is_published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                          Pubblicata
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                          Bozza
                        </span>
                      )}
                      {!page.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                          Disattivata
                        </span>
                      )}
                      {page.requires_payment && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                          Pagamento: €{page.amount?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{page.total_views}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{page.total_submissions}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`w-4 h-4 ${parseFloat(getConversionRate(page)) > 20 ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {getConversionRate(page)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/landing/${page.slug}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizza"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(page.slug)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Copia URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/landing-pages/${page.id}/edit`)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
