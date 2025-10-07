import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Building2, Edit, Trash2, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { SponsorForm } from './SponsorForm';

interface Sponsor {
  id: number;
  company_name: string;
  sector?: string;
  sponsorship_type?: string;
  amount?: number;
  payment_status: string;
  contact_name?: string;
  contact_email?: string;
  editorial_independence_declared: boolean;
  conflict_of_interest_disclosed: boolean;
  sunshine_act_compliant: boolean;
}

interface SponsorsListProps {
  eventId: number;
}

export const SponsorsList: React.FC<SponsorsListProps> = ({ eventId }) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    fetchSponsors();
  }, [eventId]);

  const fetchSponsors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `https://crm.digitalhealth.sm/api/v1/sponsors/event/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSponsors(response.data.items);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSponsor = async (sponsorId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo sponsor?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `https://crm.digitalhealth.sm/api/v1/sponsors/${sponsorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert('Errore durante l\'eliminazione dello sponsor');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Da ricevere',
      partial: 'Parziale',
      completed: 'Completato',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento sponsor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sponsor ({sponsors.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>Aggiungi Sponsor</span>
        </button>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500">Nessuno sponsor registrato</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="text-blue-600" size={20} />
                    <h4 className="font-semibold text-lg">{sponsor.company_name}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                        sponsor.payment_status
                      )}`}
                    >
                      {getPaymentStatusLabel(sponsor.payment_status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    {sponsor.sector && (
                      <div>
                        <span className="text-gray-500">Settore:</span>
                        <span className="ml-2 font-medium">{sponsor.sector}</span>
                      </div>
                    )}
                    {sponsor.sponsorship_type && (
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <span className="ml-2 font-medium">{sponsor.sponsorship_type}</span>
                      </div>
                    )}
                    {sponsor.amount && (
                      <div className="flex items-center">
                        <DollarSign size={14} className="text-green-600" />
                        <span className="font-medium text-green-700">
                          € {sponsor.amount.toLocaleString('it-IT')}
                        </span>
                      </div>
                    )}
                    {sponsor.contact_name && (
                      <div>
                        <span className="text-gray-500">Referente:</span>
                        <span className="ml-2">{sponsor.contact_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-xs">
                    <div className="flex items-center space-x-1">
                      {sponsor.editorial_independence_declared ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                      <span>Indipendenza editoriale</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {sponsor.conflict_of_interest_disclosed ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                      <span>COI disclosed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {sponsor.sunshine_act_compliant ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                      <span>Sunshine Act</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingSponsor(sponsor);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteSponsor(sponsor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sponsor Form Modal */}
      {showForm && (
        <SponsorForm
          eventId={eventId}
          sponsor={editingSponsor || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingSponsor(null);
          }}
          onSuccess={() => {
            fetchSponsors();
          }}
        />
      )}
    </div>
  );
};
