import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, FolderOpen } from 'lucide-react';
import { documentsAPI } from '../../api/documents';
import { Enrollment, Document } from '../../types';

interface EnrollmentWithDocuments {
  enrollment: Enrollment;
  documents: Document[];
}

interface DocumentHistoryProps {
  enrollments: Enrollment[];
}

export const DocumentHistory: React.FC<DocumentHistoryProps> = ({ enrollments }) => {
  const [enrollmentsWithDocs, setEnrollmentsWithDocs] = useState<EnrollmentWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDocuments();
  }, [enrollments]);

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      const promises = enrollments.map(async (enrollment) => {
        try {
          const docsResponse = await documentsAPI.getByEntity('enrollment', enrollment.id);
          return {
            enrollment,
            documents: docsResponse.documents || []
          };
        } catch (error) {
          console.error(`Error loading documents for enrollment ${enrollment.id}:`, error);
          return {
            enrollment,
            documents: []
          };
        }
      });

      const results = await Promise.all(promises);
      // Filtra solo enrollment che hanno documenti
      setEnrollmentsWithDocs(results.filter(r => r.documents.length > 0));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Caricamento documenti...</div>
      </div>
    );
  }

  if (enrollmentsWithDocs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FolderOpen className="mx-auto mb-2" size={48} />
        <p>Nessun documento caricato per le iscrizioni di questo partecipante</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {enrollmentsWithDocs.map(({ enrollment, documents }) => (
        <div key={enrollment.id} className="border rounded-lg overflow-hidden">
          {/* Event Header */}
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {enrollment.event?.title || 'Evento'}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    Iscrizione: {new Date(enrollment.enrollment_date).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {documents.length} documento{documents.length !== 1 ? 'i' : ''}
              </span>
            </div>
          </div>

          {/* Documents List */}
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="text-gray-400" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>
                        {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}
                      </span>
                      {doc.tags && doc.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {doc.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc.file_url, doc.file_name)}
                  className="ml-3 text-blue-600 hover:text-blue-800"
                  title="Scarica documento"
                >
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
