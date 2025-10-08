import React, { useState, useEffect } from 'react';
import { X, UserCog, Shield, Save } from 'lucide-react';
import { usersAPI } from '../../api/users';
import { User, UserRole } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin (accesso completo sistema)',
  admin: 'Admin (gestione provider + dati)',
  operator: 'Operatore (inserimento/modifica dati)',
  viewer: 'Visualizzatore (sola lettura)',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: 'Accesso completo + configurazione sistema',
  admin: 'Gestione completa provider e dati',
  operator: 'Inserimento e modifica dati',
  viewer: 'Solo visualizzazione, nessuna modifica',
};

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const { isSuperadmin } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    active: user.active,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome obbligatorio';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Cognome obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Build update payload
      const updates: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        active: formData.active,
      };

      // Only include role if superadmin
      if (isSuperadmin()) {
        updates.role = formData.role;
      }

      const updatedUser = await usersAPI.update(user.id, updates);
      onSuccess(updatedUser);
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        alert(`Errore: ${error.response.data.detail}`);
      } else {
        alert('Errore durante l\'aggiornamento dell\'utente');
      }
      console.error('Errore aggiornamento utente:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <UserCog className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Modifica Utente</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dati Personali</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mario"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Rossi"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="mario.rossi@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role - Only for superadmin */}
          {isSuperadmin() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruolo <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {(['viewer', 'operator', 'admin', 'superadmin'] as UserRole[]).map((role) => (
                  <label
                    key={role}
                    className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                      formData.role === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) => handleChange('role', e.target.value as UserRole)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{ROLE_LABELS[role]}</div>
                      <div className="text-xs text-gray-600">{ROLE_DESCRIPTIONS[role]}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>
          )}

          {/* Non-superadmin users see role as read-only */}
          {!isSuperadmin() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruolo
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{ROLE_LABELS[user.role]}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Solo i superadmin possono modificare i ruoli
              </p>
            </div>
          )}

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Utente Attivo</span>
                <p className="text-xs text-gray-500">
                  Gli utenti disattivati non possono accedere al sistema
                </p>
              </div>
            </label>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Informazioni</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">ID:</span> {user.id}</p>
              <p><span className="font-medium">Creato il:</span> {new Date(user.created_at).toLocaleString('it-IT')}</p>
              <p><span className="font-medium">Ultimo accesso:</span> {user.last_login ? new Date(user.last_login).toLocaleString('it-IT') : 'Mai'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salva Modifiche</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
