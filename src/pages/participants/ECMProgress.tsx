import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, Video, File, Link, MessageSquare, BookOpen } from 'lucide-react';
import { ecmAPI } from '../../api/ecm';

interface Material {
  id: number;
  name: string;
  modname: string;
  section: string;
  url?: string;
  visible: number;
  instance: number;
  completed: boolean;
  tracking: number;
  timecompleted?: number;
}

interface ECMData {
  id: number;
  enrollment_id: number;
  participant_id: number;
  event_id: number;
  completed: boolean;
  completion_date: string | null;
  grade: number | string | null;
  attestato_url?: string | null;
  moodle_synced_at: string | null;
  activities?: any[];
  materials?: Material[];
}

export default function ECMProgress() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [ecmData, setEcmData] = useState<ECMData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadECMData();
  }, [enrollmentId]);

  const loadECMData = async () => {
    if (!enrollmentId) return;
    try {
      const data = await ecmAPI.getByEnrollment(parseInt(enrollmentId));
      setEcmData(data as any);
    } catch (error) {
      console.error('Error loading ECM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (modname: string) => {
    switch (modname) {
      case 'forum': return <MessageSquare className="w-5 h-5" />;
      case 'page': return <FileText className="w-5 h-5" />;
      case 'label': return <BookOpen className="w-5 h-5" />;
      case 'url': return <Link className="w-5 h-5" />;
      case 'resource': return <File className="w-5 h-5" />;
      case 'quiz': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'customcert': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getModuleTypeName = (modname: string) => {
    switch (modname) {
      case 'forum': return 'Forum';
      case 'page': return 'Pagina';
      case 'label': return 'Etichetta';
      case 'url': return 'URL';
      case 'resource': return 'File';
      case 'quiz': return 'Quiz';
      case 'customcert': return 'Certificato';
      case 'feedback': return 'Feedback';
      default: return modname;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Caricamento...</div>;
  if (!ecmData) return <div className="text-center py-8">Dati ECM non trovati</div>;

  const completedMaterials = ecmData.materials?.filter(m => m.completed).length || 0;
  const totalMaterials = ecmData.materials?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Torna indietro
      </button>

      <h1 className="text-2xl font-bold mb-6">Percorso ECM</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Stato Completamento</h3>
          <div className="flex items-center">
            {ecmData.completed ? (
              <>
                <CheckCircle className="w-8 h-8 text-blue-500 mr-3" />
                <span className="text-xl font-semibold text-blue-600">Completato</span>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-gray-400 mr-3" />
                <span className="text-xl font-semibold text-gray-600">In corso</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Voto</h3>
          <div className="text-2xl font-bold">
            {ecmData.grade ? `${ecmData.grade}/100` : 'N/A'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Data Completamento</h3>
          <div className="text-xl font-semibold">
            {ecmData.completion_date 
              ? new Date(ecmData.completion_date).toLocaleDateString('it-IT')
              : 'Non completato'}
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Materiali e Attività ({completedMaterials}/{totalMaterials} completati)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {ecmData.materials && ecmData.materials.length > 0 ? (
            ecmData.materials.map((material, index) => (
              <div key={material.id || index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {material.completed ? (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {getModuleIcon(material.modname)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {material.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getModuleTypeName(material.modname)}
                          {material.section && material.section !== 'General' && (
                            <span> • {material.section}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {material.completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completato
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Da completare
                      </span>
                    )}
                  </div>
                </div>
                {material.url && (
                  <div className="mt-2 ml-11">
                    {material.modname === 'customcert' && (material.name.toLowerCase().includes('attestato') || material.name.toLowerCase().includes('partecipazione')) ? (
                      <a 
                        href={`/api/v1/ecm/attestato/${ecmData.enrollment_id}/download`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Scarica Attestato →
                      </a>
                    ) : (
                      <a 
                        href={material.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Apri in Moodle →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Nessun materiale disponibile per questo corso
            </div>
          )}
        </div>
      </div>

      {/* Attestato di Partecipazione */}
      {(ecmData as any).attestato_url && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-blue-500 mr-3" />
              <span className="font-medium text-blue-900">Attestato di Partecipazione disponibile</span>
            </div>
            <a 
              href={(ecmData as any).attestato_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Visualizza Attestato
            </a>
          </div>
        </div>
      )}

      {/* Sync Info */}
      <div className="mt-6 text-sm text-gray-500 text-right">
        Ultima sincronizzazione: {ecmData.moodle_synced_at 
          ? new Date(ecmData.moodle_synced_at).toLocaleString('it-IT')
          : 'Mai sincronizzato'}
      </div>
    </div>
  );
}
