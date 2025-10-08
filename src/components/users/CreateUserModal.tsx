import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../../api/users';
import { User, UserRole } from '../../types/user';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
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

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'operator',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.password) {
      newErrors.password = 'Password obbligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La password deve essere almeno 8 caratteri';
    }

    if (!formData.role) {
      newErrors.role = 'Ruolo obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const user = await usersAPI.create(formData);
      onSuccess(user);
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        alert(`Errore: ${error.response.data.detail}`);
      } else {
        alert('Errore durante la creazione dell\'utente');
      }
      console.error('Errore creazione utente:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = 12;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange('password', password);
    setShowPassword(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Crea Nuovo Utente</h2>
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
            <p className="text-xs text-gray-500 mt-1">
              Verrà utilizzata per l'accesso al sistema
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimo 8 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Genera
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimo 8 caratteri. Comunica la password all'utente in modo sicuro.
            </p>
          </div>

          {/* Role */}
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
                <span>Creazione...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crea Utente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
