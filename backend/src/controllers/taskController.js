const { Task, User, ActivityLog } = require('../models');

/**
 * Helper to log database changes for auditing
 */
const logActivity = async (action, entityType, entityId, changes, performedBy) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      changes,
      performedBy,
    });
    console.log('[ACTIVITY LOG] Logged:', action, entityType, entityId);
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR]', error.message);
  }
};

/**
 * Real-time update helper via Socket.io
 * Emits updates specifically to:
 * 1. Assigned user room
 * 2. Creator room
 * 3. All managers room
 */
const emitTaskUpdate = (req, task, action) => {
  const io = req.app.get('io');
  if (io) {
    const assignedId = task.assignedTo?._id || task.assignedTo;
    const creatorId = task.createdBy?._id || task.createdBy;

    // Broadcast to all managers
    io.to('role-manager').emit('task-updated', { task, action });

    // Send to assigned user specifically
    if (assignedId) {
      io.to(`user-${assignedId.toString()}`).emit('task-updated', { task, action });
    }
    // Send to creator specifically (if different from assignee)
    if (creatorId && creatorId.toString() !== assignedId?.toString()) {
      io.to(`user-${creatorId.toString()}`).emit('task-updated', { task, action });
    }
  }
};

/**
 * Create a new task (Managers only)
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
    });

    await logActivity('create', 'task', task._id, null, req.user._id);

    const taskWithRelations = await Task.findById(task._id)
      .populate('assignedTo', '_id username email')
      .populate('createdBy', '_id username email');

    emitTaskUpdate(req, taskWithRelations, 'create');

    res.status(201).json(taskWithRelations);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Users can only see their assigned tasks
    // Managers can see all tasks
    if (req.user.role === 'user') {
      query.assignedTo = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', '_id username email')
      .populate('createdBy', '_id username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('assignedTo', '_id username email')
      .populate('createdBy', '_id username email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has permission to view this task
    if (req.user.role === 'user' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Error fetching task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      // Users can only update status of their assigned tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (Object.keys(req.body).length > 1 || !req.body.status) {
        return res.status(403).json({ error: 'Users can only update task status' });
      }
    }

    const oldValues = { ...task.toObject() };
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTo', '_id username email')
      .populate('createdBy', '_id username email');

    const changes = {};
    for (const key in req.body) {
      if (oldValues[key] !== req.body[key]) {
        changes[key] = { old: oldValues[key], new: req.body[key] };
      }
    }

    await logActivity('update', 'task', id, changes, req.user._id);

    emitTaskUpdate(req, updatedTask, 'update');

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only managers can delete tasks
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const taskData = { _id: task._id, id: task._id, assignedTo: task.assignedTo, createdBy: task.createdBy };

    await Task.findByIdAndDelete(id);

    await logActivity('delete', 'task', id, null, req.user._id);

    emitTaskUpdate(req, taskData, 'delete');

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { taskId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = taskId ? { entityId: taskId, entityType: 'task' } : {};

    const logs = await ActivityLog.find(query)
      .populate('performedBy', 'id username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Error fetching activity logs' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getActivityLogs,
};
