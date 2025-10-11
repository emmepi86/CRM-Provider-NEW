import React, { useState, useEffect } from 'react';
import { X, Search, MessageCircle } from 'lucide-react';
import { User } from '../../types';
import { chatAPI } from '../../api/chat';
import { apiClient } from '../../api/client';

interface CreateDMModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: number;
}

export const CreateDMModal: React.FC<CreateDMModalProps> = ({
  onClose,
  onSuccess,
  currentUserId,
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debounced user search
  useEffect(() => {
    if (!userSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await apiClient.get<{ items: User[] }>('/users', {
          params: { search: userSearch, page_size: 20 },
        });
        // Filter out current user
        const filtered = response.data.items.filter((u) => u.id !== currentUserId);
        setSearchResults(filtered);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, currentUserId]);

  const handleCreateDM = async (user: User) => {
    setSubmitting(true);
    try {
      await chatAPI.createGroup({
        name: `DM con ${user.first_name} ${user.last_name}`,
        is_dm: true,
        member_user_ids: [user.id],
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create DM:', error);
      alert(error.response?.data?.detail || 'Errore creando il messaggio diretto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Nuovo Messaggio Diretto
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Cerca un utente per iniziare una conversazione privata
          </p>

          {/* User Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Cerca per nome o email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {userSearch.trim() && (
            <div className="mt-4 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {searching ? (
                <div className="p-8 text-center text-gray-500">
                  Ricerca in corso...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nessun utente trovato
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateDM(user)}
                      disabled={submitting}
                      className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {user.first_name?.charAt(0)?.toUpperCase()}
                        {user.last_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                          {user.role}
                        </p>
                      </div>
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!userSearch.trim() && (
            <div className="mt-8 text-center text-gray-400 py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                Inizia a digitare per cercare un utente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
