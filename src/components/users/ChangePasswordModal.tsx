import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, Save } from 'lucide-react';
import { usersAPI } from '../../api/users';
import { User } from '../../types/user';

interface ChangePasswordModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!password) {
      setError('La password è obbligatoria');
      return;
    }

    if (password.length < 8) {
      setError('La password deve essere almeno 8 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    try {
      setSubmitting(true);
      await usersAPI.changePassword(user.id, { new_password: password });
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(`Errore: ${error.response.data.detail}`);
      } else {
        setError('Errore durante il cambio password');
      }
      console.error('Errore cambio password:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = 12;
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Cambia Password</h2>
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
          {/* User Info */}
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-600">
              Cambio password per:
            </p>
            <p className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuova Password <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
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
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conferma Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ripeti la password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
            <p className="font-medium">⚠️ Attenzione</p>
            <p className="mt-1">Comunica la nuova password all'utente in modo sicuro.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
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
                <span>Cambia Password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
