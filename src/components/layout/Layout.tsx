import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mic,
  RefreshCw,
  Webhook,
  LogOut,
  Menu,
  X,
  Settings as SettingsIcon,
  Shield,
  Mail,
  FolderKanban,
  MessageSquare
} from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isSuperadmin, isAdmin, canUseMoodleSync, canUseWebhooks } = useAuth();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const { canUseChat, canUseProjects, canUseEmailHub } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { path: '/events', icon: Calendar, label: 'Eventi', show: true },
    { path: '/projects', icon: FolderKanban, label: 'Progetti', show: canUseProjects() },
    { path: '/chat', icon: MessageSquare, label: 'Chat Interna', show: canUseChat() },
    { path: '/inbox', icon: Mail, label: 'Email Hub', show: canUseEmailHub() },
    { path: '/participants', icon: Users, label: 'Partecipanti', show: true },
    { path: '/speakers', icon: Mic, label: 'Relatori', show: true },
    { path: '/users', icon: Shield, label: 'Gestione Utenti', show: isAdmin() },
    { path: '/sync', icon: RefreshCw, label: 'Sync Moodle', show: isAdmin() && canUseMoodleSync() },
    { path: '/webhooks', icon: Webhook, label: 'Webhooks', show: isAdmin() && canUseWebhooks() },
    { path: '/settings', icon: SettingsIcon, label: 'Impostazioni', show: isSuperadmin() },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">CRM ECM</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
          {sidebarOpen && user && (
            <div className="mt-4 px-4">
              <p className="text-sm text-gray-600">{user.email}</p>
              {(isSuperadmin() || isAdmin()) && (
                <div className="flex items-center space-x-1 mt-1">
                  <Shield size={12} className="text-purple-600" />
                  <p className="text-xs text-purple-600 font-medium">
                    {isSuperadmin() ? 'Superadmin' : 'Admin'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
