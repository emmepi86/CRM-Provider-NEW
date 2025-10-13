import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Loader } from 'lucide-react';
import { inboxAPI } from '../../api/inbox';
import { projectsAPI } from '../../api/projects';
import type { ReceivedEmail } from '../../types/inbox';

interface EmailToTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: ReceivedEmail;
  onSuccess?: () => void;
}

interface Project {
  id: number;
  name: string;
  status: string;
}

interface TodoList {
  id: number;
  name: string;
  project_id: number;
  items?: TodoItem[];
}

interface TodoItem {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  todo_list_id: number;
}

interface ProjectMember {
  user_id: number;
  user_name: string;
  role: string;
}

export const EmailToTaskModal: React.FC<EmailToTaskModalProps> = ({
  isOpen,
  onClose,
  email,
  onSuccess
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [existingTasks, setExistingTasks] = useState<TodoItem[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTodoListId, setSelectedTodoListId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTodoLists, setIsLoadingTodoLists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<TodoItem[]>([]);

  // Load active projects on mount
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      // Pre-fill form with email data
      setTitle(email.subject || '');
      setDescription(email.body_text || email.body_html || '');
    }
  }, [isOpen, email]);

  // Load todo lists when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadTodoLists(selectedProjectId);
      loadProjectMembers(selectedProjectId);
    } else {
      setTodoLists([]);
      setProjectMembers([]);
      setExistingTasks([]);
      setSelectedTodoListId(null);
      setAssignedTo(null);
      setDuplicateWarning([]);
    }
  }, [selectedProjectId]);

  // Check for duplicates when title changes
  useEffect(() => {
    if (existingTasks.length > 0 && title.trim()) {
      checkForDuplicates(title, existingTasks);
    } else {
      setDuplicateWarning([]);
    }
  }, [title, existingTasks]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await projectsAPI.list({ status: 'active', my_projects: false });
      setProjects(response.items || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Errore nel caricamento dei progetti');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Calculate string similarity (Levenshtein distance based)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    // Simple substring check for quick high similarity
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }

    // Check word overlap
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w)).length;
    const totalWords = Math.max(words1.length, words2.length);

    return commonWords / totalWords;
  };

  const checkForDuplicates = (taskTitle: string, tasks: TodoItem[]) => {
    if (!taskTitle.trim()) {
      setDuplicateWarning([]);
      return;
    }

    const duplicates = tasks.filter(task => {
      // Skip completed tasks
      if (task.completed) return false;

      const similarity = calculateSimilarity(taskTitle, task.title);
      // Consider as duplicate if similarity > 60%
      return similarity > 0.6;
    });

    setDuplicateWarning(duplicates);
  };

  const loadTodoLists = async (projectId: number) => {
    setIsLoadingTodoLists(true);
    try {
      const project = await projectsAPI.getById(projectId);
      setTodoLists(project.todo_lists || []);

      // Collect all tasks from all todo lists
      const allTasks: TodoItem[] = [];
      project.todo_lists?.forEach(list => {
        if (list.items) {
          allTasks.push(...list.items);
        }
      });
      setExistingTasks(allTasks);

      // Check for duplicates with current title
      if (title.trim()) {
        checkForDuplicates(title, allTasks);
      }

      // Auto-select first todo list if available
      if (project.todo_lists && project.todo_lists.length > 0) {
        setSelectedTodoListId(project.todo_lists[0].id);
      }
    } catch (err) {
      console.error('Error loading todo lists:', err);
      setError('Errore nel caricamento delle liste');
    } finally {
      setIsLoadingTodoLists(false);
    }
  };

  const loadProjectMembers = async (projectId: number) => {
    try {
      const project = await projectsAPI.getById(projectId);
      const members = project.members?.map(m => ({
        user_id: m.user_id,
        user_name: m.user_name || 'Utente',
        role: m.role
      })) || [];
      setProjectMembers(members);
    } catch (err) {
      console.error('Error loading project members:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId || !selectedTodoListId) {
      setError('Seleziona un progetto e una lista');
      return;
    }

    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await inboxAPI.createTaskFromEmail(email.id, {
        project_id: selectedProjectId,
        todo_list_id: selectedTodoListId,
        title: title.trim(),
        description: description.trim(),
        priority,
        assigned_to: assignedTo || undefined,
        due_date: dueDate || undefined
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.message || 'Errore nella creazione del task');
      }
    } catch (err: any) {
      console.error('Error creating task from email:', err);
      setError(err.response?.data?.detail || 'Errore nella creazione del task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSelectedProjectId(null);
    setSelectedTodoListId(null);
    setAssignedTo(null);
    setDueDate('');
    setDuplicateWarning([]);
    setExistingTasks([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Crea Task da Email
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progetto <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value) || null)}
              required
              disabled={isLoadingProjects}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value="">Seleziona un progetto...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Todo List Selection */}
          {selectedProjectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lista Todo <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTodoListId || ''}
                onChange={(e) => setSelectedTodoListId(Number(e.target.value) || null)}
                required
                disabled={isLoadingTodoLists || todoLists.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Seleziona una lista...</option>
                {todoLists.map(list => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              {todoLists.length === 0 && !isLoadingTodoLists && (
                <p className="text-xs text-gray-500 mt-1">
                  Nessuna lista disponibile. Crea prima una lista nel progetto.
                </p>
              )}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Inserisci il titolo del task"
            />

            {/* Duplicate Warning */}
            {duplicateWarning.length > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Task simili già esistenti in questo progetto:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 ml-2">
                      {duplicateWarning.slice(0, 3).map(task => {
                        const todoList = todoLists.find(l => l.id === task.todo_list_id);
                        return (
                          <li key={task.id} className="flex items-start gap-1">
                            <span className="mt-0.5">•</span>
                            <span>
                              <strong>{task.title}</strong>
                              {todoList && <span className="text-gray-600"> (in {todoList.name})</span>}
                            </span>
                          </li>
                        );
                      })}
                      {duplicateWarning.length > 3 && (
                        <li className="text-gray-600 italic">
                          ...e altri {duplicateWarning.length - 3} task simili
                        </li>
                      )}
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">
                      Puoi comunque creare il task, ma verifica che non sia già presente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Descrizione del task (pre-compilata dal corpo dell'email)"
            />
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorità
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assegnato a
              </label>
              <select
                value={assignedTo || ''}
                onChange={(e) => setAssignedTo(Number(e.target.value) || null)}
                disabled={!selectedProjectId || projectMembers.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Non assegnato</option>
                {projectMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scadenza
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email Info */}
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-700 mb-1">📧 Origine email:</p>
            <p className="text-xs text-gray-600">
              <strong>Da:</strong> {email.from_name || ''} &lt;{email.from_email}&gt;
            </p>
            <p className="text-xs text-gray-600">
              <strong>Data:</strong> {new Date(email.received_at).toLocaleString('it-IT')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProjectId || !selectedTodoListId || !title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creazione...' : 'Crea Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
