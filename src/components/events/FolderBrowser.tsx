import React, { useEffect, useState } from 'react';
import {
  Folder as FolderIcon,
  Upload,
  FileText,
  Trash2,
  Download,
  Plus,
  Home,
  ChevronRight,
  ChevronDown,
  FolderOpen
} from 'lucide-react';
import { foldersAPI } from '../../api/folders';
import { documentsAPI } from '../../api/documents';
import { Folder, Document } from '../../types';

interface FolderBrowserProps {
  entityType: 'event' | 'participant' | 'speaker' | 'enrollment';
  entityId: number;
  entityName?: string;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({ entityType, entityId, entityName }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: 'file' | 'folder', id: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFolders();
  }, [entityType, entityId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const allFolders = await foldersAPI.getByEntity(entityType, entityId);
      setFolders(allFolders);
      
      const root = allFolders.find(f => f.parent_folder_id === null);
      if (root) {
        navigateToFolder(root);
      }
    } catch (error) {
      console.error('Errore caricamento cartelle:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (folder: Folder) => {
    try {
      const contents = await foldersAPI.getContents(folder.id);
      setCurrentFolder(contents.folder);

      const docsResponse = await documentsAPI.getByEntity(entityType, entityId);
      const folderDocs = docsResponse.documents.filter(d => Number(d.folder_id) === Number(folder.id));
      setDocuments(folderDocs);

      buildBreadcrumb(folder);

      // Auto-expand path to current folder
      const pathToExpand = new Set<number>();
      let current = folder;
      while (current.parent_folder_id) {
        pathToExpand.add(current.parent_folder_id);
        const parent = folders.find(f => f.id === current.parent_folder_id);
        if (!parent) break;
        current = parent;
      }
      setExpandedFolders(pathToExpand);
    } catch (error) {
      console.error('Errore navigazione cartella:', error);
    }
  };

  const buildBreadcrumb = (folder: Folder) => {
    const path: Folder[] = [folder];
    let current = folder;
    
    while (current.parent_folder_id) {
      const parent = folders.find(f => f.id === current.parent_folder_id);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    setBreadcrumb(path);
  };

  const getFolderDisplayName = (folder: Folder) => {
    if (!folder.parent_folder_id && entityName) {
      return entityName;
    }
    return folder.name;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentFolder) return;

    try {
      await foldersAPI.create({
        entity_type: entityType,
        entity_id: entityId,
        parent_folder_id: currentFolder.id,
        name: newFolderName.trim(),
      });
      
      setNewFolderName('');
      setShowNewFolderForm(false);
      
      await loadFolders();
      if (currentFolder) {
        const updatedFolder = folders.find(f => f.id === currentFolder.id);
        if (updatedFolder) {
          navigateToFolder(updatedFolder);
        }
      }
    } catch (error) {
      console.error('Errore creazione cartella:', error);
      alert('Errore durante la creazione della cartella');
    }
  };

  const handleDeleteFolder = async (folderId: number, folderName: string) => {
    const confirmed = window.confirm(
      `Eliminare la cartella "${folderName}"?\n\nATTENZIONE: Verranno eliminati anche tutti i file e le sottocartelle contenuti.`
    );
    
    if (!confirmed) return;

    try {
      await foldersAPI.delete(folderId, true);
      await loadFolders();
      
      const root = folders.find(f => f.parent_folder_id === null);
      if (root) {
        navigateToFolder(root);
      }
    } catch (error) {
      console.error('Errore eliminazione cartella:', error);
      alert('Errore durante l\'eliminazione della cartella');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentFolder) return;

    try {
      setUploading(true);
      await documentsAPI.upload(entityType, entityId, selectedFile, '', currentFolder.id);
      setSelectedFile(null);

      const fileInput = document.getElementById('file-input-folder') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (currentFolder) {
        navigateToFolder(currentFolder);
      }
    } catch (error) {
      console.error('Errore upload:', error);
      alert('Errore durante il caricamento del file');
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers for FILE UPLOAD
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo per upload file, non per drag interno
    if (!draggedItem) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Solo se usciamo dal container principale
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  // Drag & Drop handlers for MOVING ITEMS
  const handleItemDragStart = (type: 'file' | 'folder', id: number) => (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleFolderDragOver = (folderId: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem) {
      e.dataTransfer.dropEffect = 'move';
      setDropTarget(folderId);
    }
  };

  const handleFolderDragLeave = () => {
    setDropTarget(null);
  };

  const handleFolderDrop = (targetFolderId: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    if (!draggedItem) return;

    // Validazione: non puoi spostare una cartella in se stessa
    if (draggedItem.type === 'folder' && draggedItem.id === targetFolderId) {
      alert('Non puoi spostare una cartella in se stessa');
      setDraggedItem(null);
      return;
    }

    // Validazione: non puoi spostare una cartella in una sua sottocartella
    if (draggedItem.type === 'folder') {
      const isDescendant = checkIfDescendant(draggedItem.id, targetFolderId);
      if (isDescendant) {
        alert('Non puoi spostare una cartella in una sua sottocartella');
        setDraggedItem(null);
        return;
      }
    }

    try {
      if (draggedItem.type === 'folder') {
        await foldersAPI.move(draggedItem.id, targetFolderId);
      } else {
        await documentsAPI.move(draggedItem.id, targetFolderId);
      }

      // Reload
      await loadFolders();
      if (currentFolder) {
        navigateToFolder(currentFolder);
      }
    } catch (error) {
      console.error('Errore spostamento:', error);
      alert('Errore durante lo spostamento');
    } finally {
      setDraggedItem(null);
    }
  };

  const checkIfDescendant = (ancestorId: number, descendantId: number): boolean => {
    let current = folders.find(f => f.id === descendantId);

    while (current) {
      if (current.id === ancestorId) return true;
      if (!current.parent_folder_id) return false;
      current = folders.find(f => f.id === current!.parent_folder_id);
    }

    return false;
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      return `Il file "${file.name}" supera i 50MB`;
    }

    // Validazione tipi file (opzionale, commentato per permettere tutti i tipi)
    // const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', ...];
    // if (!allowedTypes.includes(file.type)) {
    //   return `Il file "${file.name}" ha un formato non supportato`;
    // }

    return null;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!currentFolder) return;

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    // Validazione file
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Errori di validazione:\n\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Upload multiplo
    try {
      setUploading(true);
      setUploadQueue(validFiles);

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        try {
          await documentsAPI.upload(entityType, entityId, file, '', currentFolder.id);
        } catch (error) {
          console.error(`Errore upload ${file.name}:`, error);
          alert(`Errore durante il caricamento di "${file.name}"`);
        }
      }

      setUploadQueue([]);

      if (currentFolder) {
        navigateToFolder(currentFolder);
      }
    } catch (error) {
      console.error('Errore upload multiplo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number, fileName: string) => {
    const confirmed = window.confirm(
      `Eliminare il file "${fileName}"?\n\nQuesta operazione non può essere annullata.`
    );
    
    if (!confirmed) return;

    try {
      await documentsAPI.delete(documentId);
      
      if (currentFolder) {
        navigateToFolder(currentFolder);
      }
    } catch (error) {
      console.error('Errore eliminazione documento:', error);
      alert('Errore durante l\'eliminazione del file');
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

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getSubfolders = (parentId: number | null): Folder[] => {
    return folders.filter(f => f.parent_folder_id === parentId);
  };

  const renderFolderTree = (parentId: number | null, level: number = 0): React.ReactElement[] => {
    const children = getSubfolders(parentId);

    return children.map(folder => {
      const hasChildren = getSubfolders(folder.id).length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = currentFolder?.id === folder.id;
      const isDropTarget = dropTarget === folder.id && draggedItem?.id !== folder.id;
      const isDragged = draggedItem?.id === folder.id && draggedItem?.type === 'folder';

      return (
        <div key={folder.id}>
          <div
            draggable
            onDragStart={handleItemDragStart('folder', folder.id)}
            onDragEnd={handleItemDragEnd}
            onDragOver={handleFolderDragOver(folder.id)}
            onDragLeave={handleFolderDragLeave}
            onDrop={handleFolderDrop(folder.id)}
            className={`
              flex items-center space-x-1 px-2 py-1.5 rounded cursor-pointer transition-all
              ${isSelected ? 'bg-blue-100 text-blue-900 font-semibold' : 'hover:bg-gray-100'}
              ${isDropTarget ? 'bg-green-100 border-2 border-green-500' : ''}
              ${isDragged ? 'opacity-50 bg-gray-100' : ''}
            `}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleFolder(folder.id);
              }}
              className="flex-shrink-0"
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (
                  <ChevronRight size={16} className="text-gray-600" />
                )
              ) : (
                <div className="w-4" />
              )}
            </div>

            <div
              onClick={() => navigateToFolder(folder)}
              className="flex items-center space-x-2 flex-1 min-w-0"
            >
              {isSelected ? (
                <FolderOpen size={16} className="text-blue-600 flex-shrink-0" />
              ) : (
                <FolderIcon size={16} className="text-yellow-600 flex-shrink-0" />
              )}
              <span className="text-sm truncate">
                {!folder.parent_folder_id && entityName ? entityName : folder.name}
              </span>
            </div>

            {folder.parent_folder_id && !isDragged && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id, folder.name);
                }}
                className="flex-shrink-0 p-1 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100"
                title="Elimina"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {isExpanded && hasChildren && (
            <div>
              {renderFolderTree(folder.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-8">Caricamento...</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      {/* LEFT PANEL - Folder Tree */}
      <div className="col-span-3 bg-white rounded-lg border border-gray-200 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Cartelle</h3>
            <button
              onClick={() => setShowNewFolderForm(!showNewFolderForm)}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Nuova Cartella"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {showNewFolderForm && (
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome cartella..."
              className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crea
              </button>
              <button
                onClick={() => {
                  setShowNewFolderForm(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        <div className="p-2 group">
          {renderFolderTree(null)}
        </div>
      </div>

      {/* RIGHT PANEL - Content */}
      <div className="col-span-9 space-y-4 overflow-auto">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Home size={16} />
          {breadcrumb.map((folder, idx) => (
            <React.Fragment key={folder.id}>
              <ChevronRight size={14} />
              <button
                onClick={() => navigateToFolder(folder)}
                className={`hover:text-blue-600 truncate max-w-xs ${
                  idx === breadcrumb.length - 1 ? 'font-semibold text-gray-900' : ''
                }`}
              >
                {getFolderDisplayName(folder)}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">

          {/* Drop Zone */}
          <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            id="file-input-folder"
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                handleDrop({
                  preventDefault: () => {},
                  stopPropagation: () => {},
                  dataTransfer: { files: e.target.files }
                } as any);
              }
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3">
              <Upload className="mx-auto text-blue-600 animate-pulse" size={48} />
              <div>
                <p className="text-lg font-semibold text-gray-900">Caricamento in corso...</p>
                {uploadQueue.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadQueue.length} file in coda
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className={`mx-auto ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} size={48} />
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {isDragging ? 'Rilascia i file qui' : 'Trascina i file qui'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  oppure{' '}
                  <label
                    htmlFor="file-input-folder"
                    className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                  >
                    sfoglia
                  </label>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Massimo 50MB per file • Upload multiplo supportato
                </p>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Documenti ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Nessun documento in questa cartella</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                draggable
                onDragStart={handleItemDragStart('file', doc.id)}
                onDragEnd={handleItemDragEnd}
                className={`p-4 flex items-center justify-between transition-all cursor-move ${
                  draggedItem?.type === 'file' && draggedItem?.id === doc.id
                    ? 'bg-gray-100 opacity-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText size={24} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(doc.file_url, doc.file_name)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.file_name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
