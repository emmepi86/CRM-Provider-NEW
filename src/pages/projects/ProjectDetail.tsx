import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, MessageSquare, Activity, Settings, Plus } from 'lucide-react';
import { projectsAPI, ProjectDetailResponse, TodoItem } from '../../api/projects';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todos' | 'messages' | 'activity'>('todos');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

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
          {project.todo_lists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna todo list</h3>
              <p className="text-gray-500">Crea la tua prima lista di task!</p>
            </div>
          ) : (
            project.todo_lists.map(list => (
              <div key={list.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* List Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                    <div className="text-sm text-gray-500">
                      {list.completed_items_count || 0}/{list.items_count || 0} completati
                      {list.items_count && list.items_count > 0 && (
                        <span className="ml-2">({Math.round((list.completed_items_count || 0) / list.items_count * 100)}%)</span>
                      )}
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

                {/* Todo Items */}
                <div className="divide-y divide-gray-200">
                  {list.items?.map((item: TodoItem) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
                      </div>
                    </div>
                  )) || <p className="px-6 py-4 text-gray-500 text-sm">Nessun task</p>}

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

      {activeTab === 'messages' && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Message Board</h3>
          <p className="text-gray-500">Coming soon...</p>
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
    </div>
  );
};
