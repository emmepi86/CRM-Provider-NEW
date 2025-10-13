import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, CheckSquare, MessageSquare, Calendar, Clock } from 'lucide-react';
import { projectsAPI, Project } from '../../api/projects';
import { CreateProjectModal } from '../projects/CreateProjectModal';

interface EventProjectsTabProps {
  eventId: number;
}

export const EventProjectsTab: React.FC<EventProjectsTabProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [eventId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.listByEvent(eventId);
      setProjects(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Errore caricamento progetti:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      archived: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Attivo',
      planning: 'Pianificazione',
      on_hold: 'In Pausa',
      completed: 'Completato',
      archived: 'Archiviato'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Caricamento progetti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Progetti ({total})</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Nuovo Progetto</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">Nessun progetto associato a questo evento</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Crea il primo progetto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-gray-700">
                    {project.members_count || 0} membri
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckSquare size={16} className="text-gray-400" />
                  <span className="text-gray-700">
                    {project.completed_todos_count || 0}/{project.todos_count || 0} task
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-gray-700">
                    {project.messages_count || 0} messaggi
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-3 space-y-2">
                {project.start_date && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    <span>Inizio: {new Date(project.start_date).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
                {project.due_date && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock size={14} className="mr-2" />
                    <span>Scadenza: {new Date(project.due_date).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
              </div>

              {/* Color indicator */}
              {project.color && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-xs text-gray-500">Colore progetto</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          eventId={eventId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchProjects();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
