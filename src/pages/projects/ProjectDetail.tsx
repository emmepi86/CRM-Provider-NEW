import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, MessageSquare, Activity, Settings, Plus, Pencil, Trash2, MoreVertical, Users, Target } from 'lucide-react';
import { projectsAPI, ProjectDetailResponse, TodoItem, TodoList, ProjectMember, ProjectMessage, ProjectMilestone } from '../../api/projects';
import { EditTodoModal } from '../../components/projects/EditTodoModal';
import { TodoListModal } from '../../components/projects/TodoListModal';
import { EditProjectModal } from '../../components/projects/EditProjectModal';
import { AddMemberModal } from '../../components/projects/AddMemberModal';
import { MessageBoard } from '../../components/projects/MessageBoard';
import { MessageModal } from '../../components/projects/MessageModal';
import { MilestoneModal } from '../../components/projects/MilestoneModal';
import { useAuth } from '../../hooks/useAuth';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todos' | 'messages' | 'members' | 'activity'>('todos');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  // Filters and sorting state
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [editTodoModal, setEditTodoModal] = useState<{ isOpen: boolean; item: TodoItem | null }>({ isOpen: false, item: null });
  const [todoListModal, setTodoListModal] = useState<{ isOpen: boolean; list: TodoList | null }>({ isOpen: false, list: null });
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; message: ProjectMessage | null }>({ isOpen: false, message: null });
  const [milestoneModal, setMilestoneModal] = useState<{ isOpen: boolean; milestone: ProjectMilestone | null }>({ isOpen: false, milestone: null });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await projectsAPI.getById(Number(id));
      setProject(data);
      if (data.todo_lists.length > 0 && !selectedListId) {
        setSelectedListId(data.todo_lists[0].id);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (itemId: number, completed: boolean) => {
    try {
      await projectsAPI.toggleTodoCompletion(itemId, !completed);
      fetchProject();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleAddTodo = async (listId: number) => {
    if (!newTodoTitle.trim()) return;
    try {
      await projectsAPI.createTodoItem({
        todo_list_id: listId,
        title: newTodoTitle,
        priority: 'medium'
      });
      setNewTodoTitle('');
      fetchProject();
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleUpdateTodo = async (itemId: number, data: any) => {
    try {
      await projectsAPI.updateTodoItem(itemId, data);
      fetchProject();
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  };

  const handleDeleteTodo = async (itemId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo task?')) return;
    try {
      await projectsAPI.deleteTodoItem(itemId);
      fetchProject();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleCreateTodoList = async (data: { name: string; description?: string }) => {
    try {
      await projectsAPI.createTodoList({
        project_id: Number(id),
        ...data
      });
      fetchProject();
    } catch (error) {
      console.error('Error creating todo list:', error);
      throw error;
    }
  };

  const handleUpdateTodoList = async (data: { name: string; description?: string }) => {
    if (!todoListModal.list) return;
    try {
      await projectsAPI.updateTodoList(todoListModal.list.id, data);
      fetchProject();
    } catch (error) {
      console.error('Error updating todo list:', error);
      throw error;
    }
  };

  const handleDeleteTodoList = async (listId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa lista e tutti i suoi task?')) return;
    try {
      await projectsAPI.deleteTodoList(listId);
      fetchProject();
    } catch (error) {
      console.error('Error deleting todo list:', error);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      await projectsAPI.update(Number(id), data);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const handleAddMember = async (userId: number, role: string) => {
    try {
      await projectsAPI.addMember(Number(id), { user_id: userId, role });
      fetchProject();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const handleUpdateMemberRole = async (userId: number, role: string) => {
    try {
      await projectsAPI.updateMemberRole(Number(id), userId, role);
      fetchProject();
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questo membro dal progetto?')) return;
    try {
      await projectsAPI.removeMember(Number(id), userId);
      fetchProject();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        console.error('Error removing member:', error);
      }
    }
  };

  // Message handlers
  const handleCreateMessage = async (data: any) => {
    try {
      await projectsAPI.createMessage({
        project_id: Number(id),
        ...data
      });
      fetchProject();
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  };

  const handleUpdateMessage = async (data: any) => {
    if (!messageModal.message) return;
    try {
      await projectsAPI.updateMessage(messageModal.message.id, data);
      fetchProject();
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo messaggio?')) return;
    try {
      await projectsAPI.deleteMessage(messageId);
      fetchProject();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleAddComment = async (messageId: number, content: string) => {
    try {
      await projectsAPI.createComment({
        message_id: messageId,
        content
      });
      fetchProject();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      await projectsAPI.updateComment(commentId, content);
      fetchProject();
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await projectsAPI.deleteComment(commentId);
      fetchProject();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // Milestone handlers
  const handleCreateMilestone = async (data: any) => {
    try {
      await projectsAPI.createMilestone({
        project_id: Number(id),
        ...data
      });
      fetchProject();
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  };

  const handleUpdateMilestone = async (data: any) => {
    if (!milestoneModal.milestone) return;
    try {
      await projectsAPI.updateMilestone(milestoneModal.milestone.id, data);
      fetchProject();
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa milestone?')) return;
    try {
      await projectsAPI.deleteMilestone(milestoneId);
      fetchProject();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const handleToggleMilestone = async (milestoneId: number, completed: boolean) => {
    try {
      await projectsAPI.toggleMilestoneCompletion(milestoneId, !completed);
      fetchProject();
    } catch (error) {
      console.error('Error toggling milestone:', error);
    }
  };

  // Filter and sort tasks
  const filterAndSortTasks = (items: TodoItem[]): TodoItem[] => {
    if (!items) return [];

    let filtered = [...items];

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(item => item.completed);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(item => !item.completed);
    }

    // Assignee filter
    if (assigneeFilter === 'unassigned') {
      filtered = filtered.filter(item => !item.assigned_to);
    } else if (assigneeFilter !== 'all') {
      filtered = filtered.filter(item => item.assigned_to === Number(assigneeFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'due_date':
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const resetFilters = () => {
    setPriorityFilter('all');
    setStatusFilter('all');
    setAssigneeFilter('all');
    setSortBy('created');
    setSortDirection('asc');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Progetto non trovato</h2>
        <button onClick={() => navigate('/projects')} className="mt-4 text-indigo-600 hover:text-indigo-800">
          Torna ai progetti
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded" style={{ backgroundColor: project.color || '#3b82f6' }}></div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 text-sm rounded-full ${
                project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => setEditProjectModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Impostazioni progetto"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-700">Milestones</h3>
              </div>
              <button
                onClick={() => setMilestoneModal({ isOpen: true, milestone: null })}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Nuova
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => handleToggleMilestone(milestone.id, milestone.completed)}
                    className="mt-0.5 h-4 w-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {milestone.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(milestone.due_date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setMilestoneModal({ isOpen: true, milestone })}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Modifica"
                    >
                      <Pencil className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Elimina"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {project.milestones && project.milestones.length === 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <button
              onClick={() => setMilestoneModal({ isOpen: true, milestone: null })}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              + Aggiungi Milestone
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'todos'
                ? 'border-indigo-600 text-indigo-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            To-dos
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-indigo-600 text-indigo-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Membri ({project.members.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'todos' && (
        <div className="space-y-6">
          {/* Add List Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setTodoListModal({ isOpen: true, list: null })}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuova Lista
            </button>
          </div>

          {project.todo_lists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna todo list</h3>
              <p className="text-gray-500 mb-4">Crea la tua prima lista di task!</p>
              <button
                onClick={() => setTodoListModal({ isOpen: true, list: null })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crea Lista
              </button>
            </div>
          ) : (
            project.todo_lists.map(list => (
              <div key={list.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* List Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {list.completed_items_count || 0}/{list.items_count || 0} completati
                        {list.items_count && list.items_count > 0 && (
                          <span className="ml-2">({Math.round((list.completed_items_count || 0) / list.items_count * 100)}%)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTodoListModal({ isOpen: true, list })}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Modifica lista"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteTodoList(list.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Elimina lista"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {list.completion_percentage !== undefined && list.completion_percentage > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${list.completion_percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Filters and Sorting */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Priority Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">Priorità:</label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Tutte</option>
                        <option value="urgent">Urgente</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Bassa</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">Stato:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Tutti</option>
                        <option value="active">Attivi</option>
                        <option value="completed">Completati</option>
                      </select>
                    </div>

                    {/* Assignee Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">Assegnato a:</label>
                      <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Tutti</option>
                        <option value="unassigned">Non assegnati</option>
                        {project.members.map(member => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.user_name || `User ${member.user_id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">Ordina per:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="created">Data creazione</option>
                        <option value="priority">Priorità</option>
                        <option value="due_date">Scadenza</option>
                        <option value="title">Titolo</option>
                      </select>
                    </div>

                    {/* Sort Direction */}
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      title={sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}
                    >
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>

                    {/* Reset Filters */}
                    {(priorityFilter !== 'all' || statusFilter !== 'all' || assigneeFilter !== 'all' || sortBy !== 'created' || sortDirection !== 'asc') && (
                      <button
                        onClick={resetFilters}
                        className="text-xs px-3 py-1 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Reset filtri
                      </button>
                    )}
                  </div>
                </div>

                {/* Todo Items */}
                <div className="divide-y divide-gray-200">
                  {filterAndSortTasks(list.items || []).map((item: TodoItem) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleTodo(item.id, item.completed)}
                          className="mt-1 h-5 w-5 text-indigo-600 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                            {item.priority && (
                              <span className={`px-2 py-1 rounded ${
                                item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {item.priority}
                              </span>
                            )}
                            {item.due_date && (
                              <span>📅 {new Date(item.due_date).toLocaleDateString('it-IT')}</span>
                            )}
                            {item.assignee_name && (
                              <span>👤 {item.assignee_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTodoModal({ isOpen: true, item })}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Modifica task"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Elimina task"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filterAndSortTasks(list.items || []).length === 0 && (
                    <p className="px-6 py-4 text-gray-500 text-sm text-center">
                      {list.items && list.items.length > 0
                        ? 'Nessun task corrisponde ai filtri selezionati'
                        : 'Nessun task'}
                    </p>
                  )}

                  {/* Add Todo Form */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedListId === list.id ? newTodoTitle : ''}
                        onChange={(e) => {
                          setSelectedListId(list.id);
                          setNewTodoTitle(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTodo(list.id);
                          }
                        }}
                        placeholder="Aggiungi un nuovo task..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleAddTodo(list.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Membri del Progetto</h3>
            <button
              onClick={() => setAddMemberModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Membro
            </button>
          </div>

          {/* Members List */}
          <div className="divide-y divide-gray-200">
            {project.members.map((member: ProjectMember) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {member.user_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.user_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{member.user_email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Dropdown */}
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateMemberRole(member.user_id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>

                  {/* Role Badge */}
                  <span className={`px-2 py-1 text-xs rounded ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                    member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    member.role === 'member' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Rimuovi membro"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}

            {project.members.length === 0 && (
              <p className="px-6 py-8 text-center text-gray-500">Nessun membro nel progetto</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Header with Create Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setMessageModal({ isOpen: true, message: null })}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuovo Messaggio
            </button>
          </div>

          {/* Message Board Component */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <MessageBoard
              messages={project.recent_messages || []}
              currentUserId={user?.id || 0}
              onCreateMessage={() => setMessageModal({ isOpen: true, message: null })}
              onEditMessage={(msg) => setMessageModal({ isOpen: true, message: msg })}
              onDeleteMessage={handleDeleteMessage}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {project.recent_activity.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">Nessuna attività recente</p>
            ) : (
              project.recent_activity.map(activity => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.user_name || 'System'} • {new Date(activity.created_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {editTodoModal.item && (
        <EditTodoModal
          isOpen={editTodoModal.isOpen}
          onClose={() => setEditTodoModal({ isOpen: false, item: null })}
          onSave={handleUpdateTodo}
          todoItem={editTodoModal.item}
          projectMembers={project.members}
        />
      )}

      <TodoListModal
        isOpen={todoListModal.isOpen}
        onClose={() => setTodoListModal({ isOpen: false, list: null })}
        onSave={todoListModal.list ? handleUpdateTodoList : handleCreateTodoList}
        todoList={todoListModal.list || undefined}
        projectId={Number(id)}
      />

      <EditProjectModal
        isOpen={editProjectModal}
        onClose={() => setEditProjectModal(false)}
        onSave={handleUpdateProject}
        project={project}
      />

      <AddMemberModal
        isOpen={addMemberModal}
        onClose={() => setAddMemberModal(false)}
        onAdd={handleAddMember}
        existingMemberIds={project.members.map(m => m.user_id)}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ isOpen: false, message: null })}
        onSave={messageModal.message ? handleUpdateMessage : handleCreateMessage}
        message={messageModal.message || undefined}
        projectId={Number(id)}
      />

      <MilestoneModal
        isOpen={milestoneModal.isOpen}
        onClose={() => setMilestoneModal({ isOpen: false, milestone: null })}
        onSave={milestoneModal.milestone ? handleUpdateMilestone : handleCreateMilestone}
        milestone={milestoneModal.milestone || undefined}
        projectId={Number(id)}
      />
    </div>
  );
};
