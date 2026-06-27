import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { taskAPI } from '../services/api';
import { CheckCircle, Clock, AlertCircle, Plus, Eye, LayoutGrid, List } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { joinRoom, onTaskUpdate, offTaskUpdate } = useSocket();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  const fetchTasks = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await taskAPI.getTasks(params);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  /**
   * Real-time Task Update Handler
   * This handles socket emissions and updates local state.
   * Logic:
   * - action: 'delete' -> filter out task
   * - action: 'create' -> add if user is a manager or it's assigned to them
   * - action: 'update' -> replace if user has permission, remove if reassigned to someone else
   */
  const handleTaskUpdate = useCallback(({ task, action }) => {
    const taskId = task._id || task.id;
    if (action === 'delete') {
      setTasks((prevTasks) => prevTasks.filter((t) => (t._id || t.id) !== taskId));
    } else if (action === 'create') {
      // Security/Context check: only show if relevant to this user
      if (user?.role === 'manager' || (task.assignedTo?._id || task.assignedTo) === user?.id) {
        setTasks((prevTasks) => [task, ...prevTasks]);
      }
    } else if (action === 'update') {
      // Check if user still has permission to see this task (e.g. if it was reassigned)
      const isAssignedToMe = (task.assignedTo?._id || task.assignedTo) === user?.id;
      const isCreatorByMe = (task.createdBy?._id || task.createdBy) === user?.id;
      
      if (user?.role === 'manager' || isAssignedToMe || isCreatorByMe) {
        setTasks((prevTasks) => {
          const exists = prevTasks.some((t) => (t._id || t.id) === taskId);
          if (exists) {
            return prevTasks.map((t) => ((t._id || t.id) === taskId ? task : t));
          } else {
            // Task might have been newly assigned to this user
            return [task, ...prevTasks];
          }
        });
      } else {
        // Task was reassigned to someone else - remove it from this user's view
        setTasks((prevTasks) => prevTasks.filter((t) => (t._id || t.id) !== taskId));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    if (user?.id) {
      // Join user-specific socket room for private updates
      joinRoom({ userId: user.id, role: user.role });
    }

    onTaskUpdate(handleTaskUpdate);

    return () => {
      offTaskUpdate(handleTaskUpdate);
    };
  }, [fetchTasks, user?.id, user?.role, joinRoom, onTaskUpdate, offTaskUpdate, handleTaskUpdate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [fetchTasks]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.username}!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`p-2 rounded-lg ${
                  view === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>

            {user?.role === 'manager' && (
              <button
                onClick={() => navigate('/tasks/new')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Task</span>
              </button>
            )}
          </div>
        </div>

        {view === 'list' && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 sm:px-4 py-2 rounded-lg capitalize transition text-sm ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <div className="grid gap-3 sm:gap-4">
          {tasks.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No tasks found. {user?.role === 'manager' && 'Create a new task to get started!'}
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id || task.id}
                className={`p-4 sm:p-6 rounded-xl shadow-sm border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className={`text-base sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(task.status)}
                          <span className="capitalize hidden sm:inline">{task.status.replace('_', ' ')}</span>
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Assigned to: {task.assignedTo?.username || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                      className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      <Eye size={18} />
                    </button>

                    {user?.role === 'user' && (
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id || task.id, e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm flex-1 sm:flex-none ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {view === 'list' && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg ${
                page === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
