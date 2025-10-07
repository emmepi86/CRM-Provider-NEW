import React, { useEffect, useState } from 'react';
import { Upload, FileText, Trash2, Download, Tag, Eye, Edit, FilePlus } from 'lucide-react';
import { documentsAPI } from '../../api/documents';
import { Document } from '../../types';
import { DocumentViewerModal } from '../documents/DocumentViewerModal';
import { TextEditorModal } from '../documents/TextEditorModal';

interface DocumentManagerProps {
  entityType: 'event' | 'participant' | 'speaker' | 'enrollment';
  entityId: number;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ entityType, entityId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');

  // Modal states
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [editorDocument, setEditorDocument] = useState<Document | null>(null);
  const [showNewDocumentEditor, setShowNewDocumentEditor] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [entityType, entityId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getByEntity(entityType, entityId);
      setDocuments(data.documents);
    } catch (error) {
      console.error('Errore caricamento documenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Seleziona un file da caricare');
      return;
    }

    try {
      setUploading(true);
      await documentsAPI.upload(entityType, entityId, selectedFile, tags);
      setSelectedFile(null);
      setTags('');
      fetchDocuments();
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Errore upload documento:', error);
      alert('Errore durante il caricamento del file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      return;
    }

    try {
      await documentsAPI.delete(documentId);
      setDocuments(documents.filter(d => d.id !== documentId));
    } catch (error) {
      console.error('Errore eliminazione documento:', error);
      alert('Errore durante l\'eliminazione del documento');
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `https://crm.digitalhealth.sm${fileUrl}`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
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
    if (isPDF(doc.mime_type)) {
      setViewerDocument(doc);
    } else {
      // For non-PDF, download
      handleDownload(doc.file_url, doc.file_name);
    }
  };

  const handleEditDocument = async (doc: Document) => {
    // For text documents, we need to fetch the content first
    // For now, we'll just open the editor - in a real scenario you'd fetch the content
    setEditorDocument(doc);
  };

  const handleSaveNewDocument = async (file: File, fileName: string) => {
    // Upload the file directly (it's already a DOCX File object)
    await documentsAPI.upload(entityType, entityId, file, tags || 'documento');
    fetchDocuments();
  };

  const handleSaveEditedDocument = async (file: File, fileName: string) => {
    // For edited documents, we delete the old one and create a new one
    if (editorDocument) {
      await documentsAPI.delete(editorDocument.id);
    }

    // Upload the new version (already a DOCX File object)
    await documentsAPI.upload(entityType, entityId, file, tags || 'documento');
    fetchDocuments();
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText size={20} />;
    
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    
    return <FileText size={20} />;
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-8">Caricamento documenti...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Upload size={20} className="mr-2" />
            Carica Nuovo Documento
          </h3>
          <button
            onClick={() => setShowNewDocumentEditor(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FilePlus size={18} />
            <span>Nuovo Documento</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona File
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                File selezionato: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag (opzionale)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="materiale didattico, certificato, attestato..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separa più tag con virgole
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Upload size={18} />
            <span>{uploading ? 'Caricamento...' : 'Carica Documento'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Documenti Caricati ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Nessun documento caricato</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{getFileIcon(doc.mime_type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.file_name}
                      </h4>
                      
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString('it-IT')}</span>
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Tag size={10} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {isPDF(doc.mime_type) && (
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                        title="Visualizza PDF"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {isTextDocument(doc.mime_type, doc.file_name) && (
                      <button
                        onClick={() => handleEditDocument(doc)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Modifica"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc.file_url, doc.file_name)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewerDocument && (
        <DocumentViewerModal
          fileUrl={viewerDocument.file_url}
          fileName={viewerDocument.file_name}
          onClose={() => setViewerDocument(null)}
        />
      )}

      {/* Text Editor Modal - New Document */}
      {showNewDocumentEditor && (
        <TextEditorModal
          onClose={() => setShowNewDocumentEditor(false)}
          onSave={handleSaveNewDocument}
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
