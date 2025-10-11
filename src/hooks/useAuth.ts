import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useSettings } from './useSettings';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasMinRole = (minRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      viewer: 1,
      operator: 2,
      admin: 3,
      superadmin: 4,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    return userLevel >= requiredLevel;
  };

  const isSuperadmin = (): boolean => {
    return hasRole('superadmin');
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'superadmin']);
  };

  const isOperator = (): boolean => {
    return hasAnyRole(['operator', 'admin', 'superadmin']);
  };

  const isViewer = (): boolean => {
    return !!user; // All authenticated users have at least viewer access
  };

  const canManageSettings = (): boolean => {
    return isSuperadmin();
  };

  const canCreateEdit = (): boolean => {
    return isOperator();
  };

  const canDelete = (): boolean => {
    return isAdmin();
  };

  /**
   * Feature permissions based on system settings
   * Superadmin ALWAYS sees all features regardless of settings
   * Other roles respect the settings
   */
  const canUseBadges = (): boolean => {
    if (isSuperadmin()) return true; // Superadmin always sees everything
    return settings?.badges_enabled ?? true;
  };

  const canUseMoodleSync = (): boolean => {
    if (isSuperadmin()) return true;
    return settings?.moodle_sync_enabled ?? true;
  };

  const canUseSponsors = (): boolean => {
    if (isSuperadmin()) return true;
    return settings?.sponsors_enabled ?? true;
  };

  const canUsePatronages = (): boolean => {
    if (isSuperadmin()) return true;
    return settings?.patronages_enabled ?? true;
  };

  const canUseDocuments = (): boolean => {
    if (isSuperadmin()) return true;
    return settings?.documents_enabled ?? true;
  };

  const canUseWebhooks = (): boolean => {
    if (isSuperadmin()) return true;
    return settings?.webhooks_enabled ?? false;
  };

  /**
   * Granular user permissions - respect both system settings and user-level permissions
   */
  const canUseChat = (): boolean => {
    if (isSuperadmin()) return true;
    if (!settings?.chat_enabled) return false; // System-wide disabled
    return user?.can_use_chat ?? true;
  };

  const canCreateChannels = (): boolean => {
    if (isSuperadmin()) return true;
    if (!settings?.chat_enabled) return false;
    if (!user?.can_use_chat) return false;
    return user?.can_create_channels ?? false;
  };

  const canUseProjects = (): boolean => {
    if (isSuperadmin()) return true;
    return user?.can_use_projects ?? true;
  };

  const canUseEmailHub = (): boolean => {
    if (isSuperadmin()) return true;
    return user?.can_use_email_hub ?? true;
  };

  const canUseLandingPages = (): boolean => {
    if (isSuperadmin()) return true;
    if (!settings?.landing_pages_enabled) return false;
    return user?.can_use_landing_pages ?? false;
  };

  return {
    user,
    loading: loading || settingsLoading,
    settings,
    hasRole,
    hasAnyRole,
    hasMinRole,
    isSuperadmin,
    isAdmin,
    isOperator,
    isViewer,
    canManageSettings,
    canCreateEdit,
    canDelete,
    // Feature permissions (system-wide)
    canUseBadges,
    canUseMoodleSync,
    canUseSponsors,
    canUsePatronages,
    canUseDocuments,
    canUseWebhooks,
    // Granular user permissions
    canUseChat,
    canCreateChannels,
    canUseProjects,
    canUseEmailHub,
    canUseLandingPages,
  };
};
