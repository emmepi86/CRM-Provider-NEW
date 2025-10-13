import React, { useState, useEffect } from 'react';
import { Paperclip, Upload, Download, Trash2, FileText, X, Eye, Edit } from 'lucide-react';
import { documentsAPI } from '../../api/documents';
import { foldersAPI } from '../../api/folders';
import { DocumentViewerModal } from '../documents/DocumentViewerModal';
import { TextEditorModal } from '../documents/TextEditorModal';

interface TaskAttachmentsProps {
  todoItemId: number;
  projectName: string;
  eventId?: number;
}

interface Document {
  id: number;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  todoItemId,
  projectName,
  eventId
}) => {
  const [attachments, setAttachments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [projectFolderId, setProjectFolderId] = useState<number | null>(null);

  // Modal states
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [editorDocument, setEditorDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchAttachments();
    if (eventId) {
      findProjectFolder();
    }
  }, [todoItemId, eventId]);

  const findProjectFolder = async () => {
    if (!eventId) return;

    try {
      const folders = await foldersAPI.getByEntity('event', eventId);
      let folder = folders.find((f: any) => f.name === projectName);

      // Create folder if it doesn't exist
      if (!folder) {
        console.log(`Creating project folder "${projectName}" for event ${eventId}`);
        folder = await foldersAPI.create({
          entity_type: 'event',
          entity_id: eventId,
          name: projectName,
          description: `Cartella progetto: ${projectName}`
        });
      }

      if (folder) {
        setProjectFolderId(folder.id);
      }
    } catch (error) {
      console.error('Error finding/creating project folder:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getByEntity('todo_item', todoItemId);
      setAttachments(response.documents || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Ensure folder exists before uploading
      if (eventId && !projectFolderId) {
        await findProjectFolder();
      }

      await documentsAPI.upload(
        'todo_item',
        todoItemId,
        file,
        '',
        projectFolderId || undefined
      );
      await fetchAttachments();
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Errore durante il caricamento del file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo allegato?')) return;

    try {
      await documentsAPI.delete(docId);
      await fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isPDF = (mimeType?: string) => {
    return mimeType?.includes('pdf') || false;
  };

  const isTextDocument = (mimeType?: string, fileName?: string) => {
    if (!mimeType && !fileName) return false;

    // Check by MIME type
    if (mimeType && (
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword') ||
      mimeType.includes('application/vnd.openxmlformats-officedocument')
    )) {
      return true;
    }

    // Check by file extension
    if (fileName && (fileName.endsWith('.docx') || fileName.endsWith('.doc'))) {
      return true;
    }

    return false;
  };

  const handleViewDocument = (doc: Document) => {
    setViewerDocument(doc);
  };

  const handleEditDocument = (doc: Document) => {
    setEditorDocument(doc);
  };

  const handleSaveEditedDocument = async (file: File, fileName: string) => {
    if (editorDocument) {
      await documentsAPI.delete(editorDocument.id);
    }

    // Upload the new version
    await documentsAPI.upload(
      'todo_item',
      todoItemId,
      file,
      '',
      projectFolderId || undefined
    );

    // Reload attachments
    await fetchAttachments();
  };

  if (loading) {
    return (
      <div className="text-xs text-gray-500 mt-2">
        Caricamento allegati...
      </div>
    );
  }

  return (
    <div className="mt-2">
      {attachments.length > 0 || showUpload ? (
        <div className="space-y-1">
          {attachments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded text-xs group hover:bg-gray-100"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate text-gray-700">{doc.file_name}</span>
                <span className="text-gray-400 flex-shrink-0">
                  ({formatFileSize(doc.file_size)})
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isPDF(doc.mime_type) && (
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-1 hover:bg-purple-100 rounded"
                    title="Visualizza PDF"
                  >
                    <Eye size={12} className="text-purple-600" />
                  </button>
                )}
                {isTextDocument(doc.mime_type, doc.file_name) && (
                  <button
                    onClick={() => handleEditDocument(doc)}
                    className="p-1 hover:bg-green-100 rounded"
                    title="Modifica"
                  >
                    <Edit size={12} className="text-green-600" />
                  </button>
                )}
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Scarica"
                >
                  <Download size={12} className="text-gray-600" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 hover:bg-red-100 rounded"
                  title="Elimina"
                >
                  <Trash2 size={12} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {showUpload && (
            <div className="relative p-2 bg-blue-50 rounded border border-blue-200">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-1 right-1 p-0.5 hover:bg-blue-100 rounded"
              >
                <X size={12} className="text-gray-600" />
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload size={14} className="text-blue-600" />
                <span className="text-xs text-blue-700">
                  {uploading ? 'Caricamento...' : 'Seleziona file'}
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Paperclip size={12} />
              <span>Aggiungi allegato</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <Paperclip size={12} />
          <span>Allega file</span>
        </button>
      )}

      {/* PDF Viewer Modal */}
      {viewerDocument && (
        <DocumentViewerModal
          fileUrl={viewerDocument.file_url}
          fileName={viewerDocument.file_name}
          onClose={() => setViewerDocument(null)}
        />
      )}

      {/* Text Editor Modal - Edit Document */}
      {editorDocument && (
        <TextEditorModal
          fileName={editorDocument.file_name}
          existingDocxUrl={editorDocument.file_url}
          onClose={() => setEditorDocument(null)}
          onSave={handleSaveEditedDocument}
        />
      )}
    </div>
  );
};
