import React, { useState, useEffect } from 'react';
import { X, Hash, Lock, Users, Search, UserPlus, Trash2 } from 'lucide-react';
import { ChannelType, ChatChannelCreate } from '../../types/chat';
import { User } from '../../types';
import { chatAPI } from '../../api/chat';
import { apiClient } from '../../api/client';

interface CreateChannelModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ChatChannelCreate>({
    name: '',
    description: '',
    channel_type: ChannelType.PUBLIC,
    is_read_only: false,
  });

  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
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
        setSearchResults(response.data.items);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleAddUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearch('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Il nome del canale è obbligatorio');
      return;
    }

    setSubmitting(true);
    try {
      // Create channel
      const channel = await chatAPI.createChannel(formData);

      // Add selected users as members
      if (selectedUsers.length > 0) {
        await Promise.all(
          selectedUsers.map((user) =>
            chatAPI.addChannelMember(channel.id, user.id, 'member')
          )
        );
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create channel:', error);
      alert(error.response?.data?.detail || 'Errore creando il canale');
    } finally {
      setSubmitting(false);
    }
  };

  const getChannelTypeIcon = (type: ChannelType) => {
    switch (type) {
      case ChannelType.PUBLIC:
        return <Hash className="w-5 h-5" />;
      case ChannelType.PRIVATE:
        return <Lock className="w-5 h-5" />;
      case ChannelType.DEPARTMENT:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Crea Nuovo Canale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Canale *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="es. marketing, sviluppo, generale"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Il nome verrà convertito in minuscolo e gli spazi sostituiti con trattini
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Breve descrizione dello scopo del canale"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Channel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo Canale *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(ChannelType).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, channel_type: type })}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    formData.channel_type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getChannelTypeIcon(type)}
                  <span className="mt-2 text-sm font-medium capitalize">
                    {type}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p><strong>Public:</strong> Visibile e accessibile a tutti</p>
              <p><strong>Private:</strong> Solo membri invitati</p>
              <p><strong>Department:</strong> Per team specifici</p>
            </div>
          </div>

          {/* Read-only */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="read_only"
              checked={formData.is_read_only}
              onChange={(e) =>
                setFormData({ ...formData, is_read_only: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="read_only" className="ml-2 text-sm text-gray-700">
              Canale read-only (solo amministratori possono postare)
            </label>
          </div>

          {/* Add Members (for private channels) */}
          {formData.channel_type === ChannelType.PRIVATE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aggiungi Membri
              </label>

              {/* User Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cerca utenti per nome o email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                {(searching || searchResults.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searching ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Ricerca in corso...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Nessun utente trovato
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAddUser(user)}
                          disabled={selectedUsers.some((u) => u.id === user.id)}
                          className={`w-full flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left ${
                            selectedUsers.some((u) => u.id === user.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.first_name?.charAt(0)?.toUpperCase()}
                            {user.last_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {selectedUsers.some((u) => u.id === user.id) ? (
                            <span className="text-xs text-green-600 font-medium">
                              Aggiunto
                            </span>
                          ) : (
                            <UserPlus className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Membri selezionati ({selectedUsers.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                            {user.first_name?.charAt(0)?.toUpperCase()}
                            {user.last_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creazione...' : 'Crea Canale'}
          </button>
        </div>
      </div>
    </div>
  );
};
