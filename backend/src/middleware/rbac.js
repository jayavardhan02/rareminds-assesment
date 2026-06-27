const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const canManageTask = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Managers can manage any task
  if (req.user.role === 'manager') {
    return next();
  }

  // Users can only update status of tasks assigned to them
  if (req.method === 'PATCH' && req.body.status) {
    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
};

module.exports = { authorize, canManageTask };
