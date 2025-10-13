import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '../../api/client';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: number, role: string) => Promise<void>;
  existingMemberIds: number[];
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingMemberIds
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUserId(null);
      setRole('member');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/users/', { params: { page_size: 100 } });
      // Filter out users who are already members
      const availableUsers = data.items.filter((u: User) => !existingMemberIds.includes(u.id));
      setUsers(availableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);
    try {
      await onAdd(selectedUserId, role);
      onClose();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Aggiungi Membro</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Tutti gli utenti sono già membri del progetto
            </p>
          ) : (
            <>
              {/* User Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utente <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Seleziona utente --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruolo
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="viewer">Viewer - Solo visualizzazione</option>
                  <option value="member">Member - Può modificare task</option>
                  <option value="admin">Admin - Gestione completa</option>
                  <option value="owner">Owner - Controllo totale</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {role === 'viewer' && 'Può solo visualizzare il progetto'}
                  {role === 'member' && 'Può creare e modificare task'}
                  {role === 'admin' && 'Può gestire membri e impostazioni'}
                  {role === 'owner' && 'Ha il controllo completo del progetto'}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            {!loading && users.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting || !selectedUserId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Aggiunta...' : 'Aggiungi'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
