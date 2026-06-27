const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getActivityLogs,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize, canManageTask } = require('../middleware/rbac');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All task routes require authentication, then rate limiting (per-user: 10 req/sec)
router.use(authenticate);
router.use(apiLimiter);

// Get all tasks (with pagination and filters)
router.get('/', getTasks);

// Get activity logs
router.get('/activity', getActivityLogs);

// Create task (managers only)
router.post('/', authorize('manager'), createTask);

// Get single task
router.get('/:id', getTaskById);

// Update task
router.patch('/:id', canManageTask, updateTask);

// Delete task (managers only)
router.delete('/:id', authorize('manager'), deleteTask);

module.exports = router;
