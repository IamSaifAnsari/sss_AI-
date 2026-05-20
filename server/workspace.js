import { db, uuid } from './db.js';

// Resolve workspace_id from query/header/body. Verify user is a member.
export const requireWorkspace = (req, res, next) => {
  const wsId = req.headers['x-workspace-id'] || req.query.workspace_id || req.body?.workspace_id;
  if (!wsId) return res.status(400).json({ error: 'Workspace id required' });
  const row = db.prepare(
    'SELECT workspaces.*, workspace_members.role FROM workspaces ' +
    'JOIN workspace_members ON workspace_members.workspace_id = workspaces.id ' +
    'WHERE workspaces.id = ? AND workspace_members.user_id = ?'
  ).get(wsId, req.user.id);
  if (!row) return res.status(403).json({ error: 'Not a member of this workspace' });
  req.workspace = row;
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.workspace.role)) {
    return res.status(403).json({ error: 'Insufficient role' });
  }
  next();
};

export const createPersonalWorkspace = (userId, name) => {
  const wsId = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO workspaces (id, name, plan, created_by) VALUES (?, ?, ?, ?)').run(wsId, name, 'free', userId);
    db.prepare('INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)').run(wsId, userId, 'owner');
    db.prepare('INSERT OR REPLACE INTO user_settings (user_id, active_workspace_id) VALUES (?, ?)').run(userId, wsId);
  });
  tx();
  return wsId;
};
