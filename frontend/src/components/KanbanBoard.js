import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { taskAPI } from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks({ limit: 50 });
      const allTasks = response.data.tasks;
      
      setTasks({
        pending: allTasks.filter((t) => t.status === 'pending'),
        in_progress: allTasks.filter((t) => t.status === 'in_progress'),
        completed: allTasks.filter((t) => t.status === 'completed'),
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    try {
      await taskAPI.updateTask(draggableId, { status: newStatus });
      
      setTasks((prev) => {
        const sourceTasks = [...prev[source.droppableId]];
        const destTasks = [...prev[destination.droppableId]];
        
        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);
        
        return {
          ...prev,
          [source.droppableId]: sourceTasks,
          [destination.droppableId]: destTasks,
        };
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const columns = [
    { id: 'pending', title: 'Pending' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className={`p-3 lg:p-4 rounded-t-xl ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <h3 className={`font-semibold text-sm lg:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {column.title}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(column.id)}`}>
                  {tasks[column.id].length}
                </span>
              </h3>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 lg:p-4 rounded-b-xl min-h-[300px] lg:min-h-[400px] ${
                    snapshot.isDraggingOver
                      ? isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-100'
                      : isDark
                      ? 'bg-gray-800'
                      : 'bg-gray-50'
                  }`}
                >
                  {tasks[column.id].map((task, index) => (
                    <Draggable
                      key={task._id || task.id}
                      draggableId={String(task._id || task.id)}
                      index={index}
                      isDragDisabled={user?.role === 'user' && (task.assignedTo?._id || task.assignedTo) !== user?.id}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 lg:p-4 mb-2 lg:mb-3 rounded-lg shadow-sm ${
                            snapshot.isDragging
                              ? 'bg-blue-50 shadow-lg'
                              : isDark
                              ? 'bg-gray-700'
                              : 'bg-white'
                          }`}
                        >
                          <h4 className={`font-medium mb-2 text-sm lg:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-xs lg:text-sm mb-2 lg:mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.assignedTo?.username || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
