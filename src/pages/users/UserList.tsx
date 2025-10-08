import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Mail, Shield, CheckCircle, XCircle, Edit, Key } from 'lucide-react';
import { usersAPI } from '../../api/users';
import { User, UserRole } from '../../types/user';
import { CreateUserModal } from '../../components/users/CreateUserModal';
import { EditUserModal } from '../../components/users/EditUserModal';
import { ChangePasswordModal } from '../../components/users/ChangePasswordModal';

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  operator: 'Operatore',
  viewer: 'Visualizzatore',
};

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  operator: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.list({
        search: search || undefined,
        page,
        page_size: 50,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      alert('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await usersAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateSuccess = (user: User) => {
    fetchUsers();
    fetchStats();
    setShowCreateModal(false);
  };

  const handleEditSuccess = (user: User) => {
    fetchUsers();
    fetchStats();
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handlePasswordClick = (user: User) => {
    setChangingPasswordUser(user);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setChangingPasswordUser(null);
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    if (!window.confirm(`Vuoi ${currentActive ? 'disattivare' : 'riattivare'} questo utente?`)) {
      return;
    }

    try {
      await usersAPI.update(userId, { active: !currentActive });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Errore aggiornamento utente:', error);
      alert('Errore durante l\'aggiornamento');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Gestione Utenti</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Nuovo Utente</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Utenti</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utenti Attivi</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utenti Disattivati</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Caricamento...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Nessun utente trovato</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ruolo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ultimo Accesso</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Creato il</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ROLE_COLORS[user.role]
                          }`}
                        >
                          <Shield size={12} className="mr-1" />
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Attivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle size={12} className="mr-1" />
                            Disattivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {user.last_login ? formatDate(user.last_login) : 'Mai'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                            title="Modifica utente"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handlePasswordClick(user)}
                            className="text-purple-600 hover:bg-purple-50 p-2 rounded transition-colors"
                            title="Cambia password"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id, user.active)}
                            className={`text-sm px-3 py-1 rounded ${
                              user.active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            } transition-colors`}
                          >
                            {user.active ? 'Disattiva' : 'Riattiva'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="mt-4 text-sm text-gray-600">
              Visualizzati {users.length} di {total} utenti
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && changingPasswordUser && (
        <ChangePasswordModal
          user={changingPasswordUser}
          onClose={() => {
            setShowPasswordModal(false);
            setChangingPasswordUser(null);
          }}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </div>
  );
};
