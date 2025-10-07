import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Award, Edit, Trash2, Calendar } from 'lucide-react';
import { PatronageForm } from './PatronageForm';

interface Patronage {
  id: number;
  organization_name: string;
  organization_type?: string;
  patronage_type?: string;
  patronage_code?: string;
  issue_date?: string;
  expiry_date?: string;
  is_paid: boolean;
  amount?: number;
  conditions?: string;
  notes?: string;
}

interface PatronagesListProps {
  eventId: number;
}

export const PatronagesList: React.FC<PatronagesListProps> = ({ eventId }) => {
  const [patronages, setPatronages] = useState<Patronage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatronage, setEditingPatronage] = useState<Patronage | null>(null);

  useEffect(() => {
    fetchPatronages();
  }, [eventId]);

  const fetchPatronages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `https://crm.digitalhealth.sm/api/v1/patronages/event/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatronages(response.data.items);
    } catch (error) {
      console.error('Error fetching patronages:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePatronage = async (patronageId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo patrocinio?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `https://crm.digitalhealth.sm/api/v1/patronages/${patronageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPatronages();
    } catch (error) {
      console.error('Error deleting patronage:', error);
      alert('Errore durante l\'eliminazione del patrocinio');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento patrocini...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Patrocini ({patronages.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>Aggiungi Patrocinio</span>
        </button>
      </div>

      {patronages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Award className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500">Nessun patrocinio registrato</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {patronages.map((patronage) => (
            <div
              key={patronage.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="text-purple-600" size={20} />
                    <h4 className="font-semibold text-lg">{patronage.organization_name}</h4>
                    {patronage.is_paid && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Oneroso
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    {patronage.organization_type && (
                      <div>
                        <span className="text-gray-500">Tipo ente:</span>
                        <span className="ml-2 font-medium">{patronage.organization_type}</span>
                      </div>
                    )}
                    {patronage.patronage_type && (
                      <div>
                        <span className="text-gray-500">Tipo patrocinio:</span>
                        <span className="ml-2 font-medium">{patronage.patronage_type}</span>
                      </div>
                    )}
                    {patronage.patronage_code && (
                      <div>
                        <span className="text-gray-500">Codice:</span>
                        <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {patronage.patronage_code}
                        </span>
                      </div>
                    )}
                    {patronage.amount && (
                      <div>
                        <span className="text-gray-500">Importo:</span>
                        <span className="ml-2 font-medium text-orange-700">
                          € {patronage.amount.toLocaleString('it-IT')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-600">
                    {patronage.issue_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Rilasciato: {formatDate(patronage.issue_date)}</span>
                      </div>
                    )}
                    {patronage.expiry_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Scadenza: {formatDate(patronage.expiry_date)}</span>
                      </div>
                    )}
                  </div>

                  {patronage.conditions && (
                    <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Condizioni:</strong> {patronage.conditions}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingPatronage(patronage);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deletePatronage(patronage.id)}
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

      {/* Patronage Form Modal */}
      {showForm && (
        <PatronageForm
          eventId={eventId}
          patronage={editingPatronage || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingPatronage(null);
          }}
          onSuccess={() => {
            fetchPatronages();
          }}
        />
      )}
    </div>
  );
};
