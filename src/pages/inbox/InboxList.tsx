import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox, Mail, MailOpen, RefreshCw,
  Calendar, Archive, Settings, PenSquare,
  Folder, Plus, Loader2, FolderOpen
} from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import type { InboxStats } from '../../types/inbox';
import { ComposeEmailModal } from '../../components/inbox/ComposeEmailModal';
import { EmailViewModal } from '../../components/inbox/EmailViewModal';

export const InboxList: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Folders management
  const [folders, setFolders] = useState<Array<{ name: string; flags: string[] }>>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderEmails, setFolderEmails] = useState<Array<{
    uid: string;
    subject: string;
    from_name: string;
    from_email: string;
    date: string;
    is_read: boolean;
  }>>([]);
  const [loadingFolderContent, setLoadingFolderContent] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<{
    uid: string;
    subject: string;
    from_name: string;
    from_email: string;
    to: string;
    cc: string[];
    date: string;
    body_text: string;
    body_html: string;
    attachments: Array<{
      filename: string;
      content_type: string;
      size: number;
    }>;
    is_read: boolean;
  } | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    loadFolders();
    fetchStats();

    // Auto-load INBOX on mount
    const autoLoadInbox = async () => {
      try {
        const result = await inboxAPI.listFolders();
        if (result.success && result.folders.length > 0) {
          // Find INBOX folder (case insensitive)
          const inboxFolder = result.folders.find(f =>
            f.name.toLowerCase() === 'inbox'
          );
          if (inboxFolder) {
            handleFolderClick(inboxFolder.name);
          } else if (result.folders.length > 0) {
            // If no INBOX, load first folder
            handleFolderClick(result.folders[0].name);
          }
        }
      } catch (error) {
        console.error('Errore caricamento automatico INBOX:', error);
      }
    };

    autoLoadInbox();

    // Poll every 30 seconds for stats and refresh current folder
    const interval = setInterval(() => {
      fetchStats();
      if (selectedFolder) {
        handleFolderClick(selectedFolder);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await inboxAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Errore caricamento stats:', error);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const result = await inboxAPI.syncNow();
      if (result.success) {
        alert(`Sincronizzazione completata! ${result.new_emails} nuove email.`);
        // Refresh current folder if selected
        if (selectedFolder) {
          await handleFolderClick(selectedFolder);
        }
        fetchStats();
      } else {
        alert(`Errori: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Errore sync:', error);
      alert('Errore durante la sincronizzazione');
    } finally {
      setSyncing(false);
    }
  };

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const result = await inboxAPI.listFolders();
      if (result.success) {
        setFolders(result.folders);
      }
    } catch (error) {
      console.error('Errore caricamento cartelle:', error);
      // Non mostrare errore se IMAP non configurato
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Inserisci un nome per la cartella');
      return;
    }

    try {
      setCreatingFolder(true);
      const result = await inboxAPI.createFolder(newFolderName.trim());
      if (result.success) {
        alert('Cartella creata con successo!');
        setNewFolderName('');
        setShowCreateFolder(false);
        await loadFolders();
      } else {
        alert(`Errore: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore creazione cartella:', error);
      alert('Errore durante la creazione della cartella');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFolderClick = async (folderName: string) => {
    try {
      setSelectedFolder(folderName);
      setLoadingFolderContent(true);
      const result = await inboxAPI.browseFolder(folderName, 50);
      if (result.success) {
        setFolderEmails(result.emails);
      } else {
        alert(`Errore: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore caricamento cartella:', error);
      alert('Errore durante il caricamento della cartella');
    } finally {
      setLoadingFolderContent(false);
    }
  };

  const handleEmailClick = async (uid: string) => {
    if (!selectedFolder) return;

    try {
      setLoadingEmail(true);
      const result = await inboxAPI.getEmailFromFolder(selectedFolder, uid);
      if (result.success) {
        setSelectedEmail(result.email);
      } else {
        alert(`Errore: ${result.message}`);
      }
    } catch (error) {
      console.error('Errore caricamento email:', error);
      alert('Errore durante il caricamento dell\'email');
    } finally {
      setLoadingEmail(false);
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle reply to email
  const handleReply = async (replyData: any) => {
    try {
      // Convert File attachments to base64 (only if attachments exist)
      let attachmentsBase64 = undefined;
      if (replyData.attachments && replyData.attachments.length > 0) {
        attachmentsBase64 = await Promise.all(
          replyData.attachments.map(async (file: File) => {
            const base64 = await fileToBase64(file);
            return {
              filename: file.name,
              content: base64.split(',')[1], // Remove data:image/png;base64, prefix
              content_type: file.type || 'application/octet-stream'
            };
          })
        );
      }

      const response = await inboxAPI.composeEmail({
        to_email: replyData.to,
        subject: replyData.subject,
        body_html: `<p>${replyData.body.replace(/\n/g, '<br>')}</p>`,
        body_text: replyData.body,
        attachments: attachmentsBase64
      });

      if (!response.success) {
        throw new Error(response.message || 'Errore sconosciuto durante l\'invio');
      }

      // Close modal and refresh
      setSelectedEmail(null);
      if (selectedFolder) {
        await handleFolderClick(selectedFolder);
      }
    } catch (error: any) {
      console.error('Error sending reply:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Errore durante l\'invio della risposta';
      alert(`Errore: ${errorMsg}`);
      throw error;
    }
  };

  // Handle forward email
  const handleForward = async (forwardData: any) => {
    try {
      // Convert File attachments to base64 (only if attachments exist)
      let attachmentsBase64 = undefined;
      if (forwardData.attachments && forwardData.attachments.length > 0) {
        attachmentsBase64 = await Promise.all(
          forwardData.attachments.map(async (file: File) => {
            const base64 = await fileToBase64(file);
            return {
              filename: file.name,
              content: base64.split(',')[1],
              content_type: file.type || 'application/octet-stream'
            };
          })
        );
      }

      const response = await inboxAPI.composeEmail({
        to_email: forwardData.to,
        subject: forwardData.subject,
        body_html: `<p>${forwardData.body.replace(/\n/g, '<br>')}</p>`,
        body_text: forwardData.body,
        attachments: attachmentsBase64
      });

      if (!response.success) {
        throw new Error(response.message || 'Errore sconosciuto durante l\'invio');
      }

      // Close modal and refresh
      setSelectedEmail(null);
      if (selectedFolder) {
        await handleFolderClick(selectedFolder);
      }
    } catch (error: any) {
      console.error('Error forwarding email:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Errore durante l\'inoltro dell\'email';
      alert(`Errore: ${errorMsg}`);
      throw error;
    }
  };

  // Handle move email to folder
  const handleMoveEmail = async (destinationFolder: string) => {
    if (!selectedEmail || !selectedFolder) return;

    try {
      // For IMAP folder emails, we need to implement IMAP-based move
      // This is a placeholder - needs backend support for UID-based move
      alert('La funzione "Sposta" per le email nelle cartelle IMAP sarà disponibile a breve.');

      // TODO: Implement IMAP UID-based move
      // await inboxAPI.moveEmailByUID(selectedFolder, selectedEmail.uid, destinationFolder);

      // Close modal and refresh
      setSelectedEmail(null);
      if (selectedFolder) {
        await handleFolderClick(selectedFolder);
      }
    } catch (error) {
      console.error('Error moving email:', error);
      throw error;
    }
  };

  // Handle delete email
  const handleDeleteEmail = async () => {
    if (!selectedEmail || !selectedFolder) return;

    if (!window.confirm('Sei sicuro di voler eliminare questa email dal server? Questa azione è irreversibile.')) {
      return;
    }

    try {
      // For IMAP folder emails, we need to implement IMAP-based delete
      // This is a placeholder - needs backend support for UID-based delete
      alert('La funzione "Elimina" per le email nelle cartelle IMAP sarà disponibile a breve.');

      // TODO: Implement IMAP UID-based delete
      // await inboxAPI.deleteEmailByUID(selectedFolder, selectedEmail.uid);

      // Close modal and refresh
      setSelectedEmail(null);
      if (selectedFolder) {
        await handleFolderClick(selectedFolder);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Inbox className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Hub</h1>
            <p className="text-gray-600">
              {stats && (
                <>
                  {stats.total_threads} conversazioni
                  {stats.unread_threads > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({stats.unread_threads} non lette)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PenSquare className="w-4 h-4" />
            <span>Nuova Mail</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizzando...' : 'Sincronizza'}</span>
          </button>

          <button
            onClick={() => navigate('/inbox/settings')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Impostazioni</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Mail className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Totali</p>
                <p className="text-2xl font-bold">{stats.total_emails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <MailOpen className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Non Lette</p>
                <p className="text-2xl font-bold">{stats.unread_emails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Calendar className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Oggi</p>
                <p className="text-2xl font-bold">{stats.emails_today}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Archive className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Questa Settimana</p>
                <p className="text-2xl font-bold">{stats.emails_this_week}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Folders */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Cartelle IMAP</span>
              </h3>
              <button
                onClick={loadFolders}
                disabled={loadingFolders}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Ricarica cartelle"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFolders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Folders List */}
            <div className="space-y-1">
              {loadingFolders ? (
                <div className="text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                </div>
              ) : folders.length > 0 ? (
                folders.map((folder, index) => (
                  <div
                    key={index}
                    onClick={() => handleFolderClick(folder.name)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFolder === folder.name
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Folder className={`w-4 h-4 flex-shrink-0 ${
                      selectedFolder === folder.name ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm truncate ${
                      selectedFolder === folder.name ? 'font-medium text-blue-900' : 'text-gray-900'
                    }`}>
                      {folder.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-3">
                  Nessuna cartella caricata.
                  <br />
                  Clicca su ↻ per caricare.
                </p>
              )}
            </div>

            {/* Create Folder Button */}
            {!showCreateFolder ? (
              <button
                onClick={() => setShowCreateFolder(true)}
                className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Cartella</span>
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nome cartella"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    } else if (e.key === 'Escape') {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }
                  }}
                  autoFocus
                  disabled={creatingFolder}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCreateFolder}
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {creatingFolder ? 'Creazione...' : 'Crea'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }}
                    disabled={creatingFolder}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500">
                💡 Le cartelle IMAP vengono create sul server email e saranno visibili in tutti i client.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
      {/* Folder Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {selectedFolder ? (
          // Folder view
          <div>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{selectedFolder}</h3>
                <span className="text-sm text-gray-500">({folderEmails.length} email)</span>
              </div>
            </div>
            {loadingFolderContent ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Caricamento email...</p>
              </div>
            ) : folderEmails.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cartella vuota</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {folderEmails.map((email) => (
                  <div
                    key={email.uid}
                    onClick={() => handleEmailClick(email.uid)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !email.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        !email.is_read ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Mail className={!email.is_read ? 'text-blue-600' : 'text-gray-600'} size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium truncate ${
                            !email.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {email.from_name || email.from_email}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {new Date(email.date).toLocaleString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <p className={`text-sm mb-1 truncate ${
                          !email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}>
                          {email.subject || '(Nessun oggetto)'}
                        </p>

                        {!email.is_read && (
                          <span className="inline-block text-xs px-2 py-0.5 bg-blue-600 text-white rounded font-medium mt-1">
                            Non letto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // No folder selected - prompt user
          <div className="text-center py-16">
            <FolderOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona una cartella</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Clicca su una cartella nella barra laterale per visualizzare le tue email.
              <br />
              Le email vengono caricate direttamente dal server IMAP.
            </p>
          </div>
        )}
      </div>

          {/* Compose Email Modal */}
          {showComposeModal && (
            <ComposeEmailModal
              onClose={() => setShowComposeModal(false)}
              onSuccess={() => {
                setShowComposeModal(false);
                // Refresh current folder if selected
                if (selectedFolder) {
                  handleFolderClick(selectedFolder);
                }
                fetchStats();
              }}
            />
          )}

          {/* Email View Modal */}
          {selectedEmail && selectedFolder && (
            <EmailViewModal
              email={selectedEmail}
              folderName={selectedFolder}
              folders={folders}
              onClose={() => setSelectedEmail(null)}
              onReply={handleReply}
              onForward={handleForward}
              onMove={handleMoveEmail}
              onDelete={handleDeleteEmail}
            />
          )}

          {/* Loading Email Overlay */}
          {loadingEmail && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-700 mt-2">Caricamento email...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
