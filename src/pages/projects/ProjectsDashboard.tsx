import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, CheckSquare, MessageSquare, Users, Calendar } from 'lucide-react';
import { projectsAPI, Project, ProjectStats } from '../../api/projects';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';

export const ProjectsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus, showMyProjects]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, statsData] = await Promise.all([
        projectsAPI.list({ status: filterStatus === 'all' ? undefined : filterStatus, my_projects: showMyProjects }),
        projectsAPI.getStats()
      ]);
      setProjects(projectsData.items);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = (project: Project) => {
    if (!project.todos_count || project.todos_count === 0) return 0;
    return Math.round(((project.completed_todos_count || 0) / project.todos_count) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-indigo-600" />
            Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500">Gestisci i tuoi progetti in stile Basecamp</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuovo Progetto
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progetti Attivi</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active_projects}</p>
              </div>
              <FolderKanban className="w-12 h-12 text-indigo-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Todo Completati</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completed_todos}/{stats.total_todos}
                </p>
              </div>
              <CheckSquare className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Todo Scaduti</p>
                <p className="text-3xl font-bold text-gray-900">{stats.overdue_todos}</p>
              </div>
              <Calendar className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totale Progetti</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_projects}</p>
              </div>
              <FolderKanban className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'on_hold', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tutti' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showMyProjects}
              onChange={(e) => setShowMyProjects(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Solo i miei progetti</span>
          </label>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Caricamento progetti...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto trovato</h3>
          <p className="text-gray-500 mb-6">Inizia creando il tuo primo progetto!</p>
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crea Progetto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            >
              {/* Color Bar */}
              <div className="h-2" style={{ backgroundColor: project.color || '#3b82f6' }}></div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Progress Bar */}
                {project.todos_count && project.todos_count > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Completamento</span>
                      <span>{getCompletionPercentage(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${getCompletionPercentage(project)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="w-4 h-4" />
                    <span>{project.completed_todos_count || 0}/{project.todos_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{project.messages_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.members_count || 0}</span>
                  </div>
                </div>

                {/* Dates */}
                {project.due_date && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Scadenza: {new Date(project.due_date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(project) => {
            fetchData();
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </div>
  );
};
