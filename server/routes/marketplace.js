import { Router } from 'express';
import { db, uuid } from '../db.js';
import { requireAuth } from '../auth.js';
import { requireWorkspace, requireRole } from '../workspace.js';
import { logger } from '../logger.js';

const router = Router();

router.get('/', requireAuth, requireWorkspace, (req, res) => {
  const installed = db.prepare(
    'SELECT item_id FROM marketplace_installations WHERE workspace_id = ?'
  ).all(req.workspace.id).map((r) => r.item_id);
  const items = db.prepare(
    'SELECT id, slug, name, category, description, tags, rating, installs FROM marketplace_items ORDER BY installs DESC'
  ).all().map((r) => ({ ...r, tags: JSON.parse(r.tags || '[]'), installed: installed.includes(r.id) }));
  res.json({ items });
});

router.post('/:slug/install', requireAuth, requireWorkspace, requireRole('owner', 'admin', 'developer'), (req, res) => {
  const item = db.prepare('SELECT * FROM marketplace_items WHERE slug = ?').get(req.params.slug);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const existing = db.prepare('SELECT 1 FROM marketplace_installations WHERE workspace_id = ? AND item_id = ?').get(req.workspace.id, item.id);
  if (existing) return res.status(409).json({ error: 'Already installed' });

  const template = JSON.parse(item.template || '{}');
  const createdRefs = { agents: [], workflows: [] };

  const tx = db.transaction(() => {
    for (const a of template.agents || []) {
      const id = uuid();
      db.prepare(
        'INSERT INTO agents (id, workspace_id, name, description, model, system_prompt, tools, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, req.workspace.id, a.name, a.description || '', a.model || 'gpt-4o', a.system_prompt || '', JSON.stringify(a.tools || []), req.user.id);
      createdRefs.agents.push({ id, name: a.name });
    }
    for (const w of template.workflows || []) {
      const id = uuid();
      db.prepare(
        'INSERT INTO workflows (id, workspace_id, name, trigger, steps, created_by) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, req.workspace.id, w.name, w.trigger || 'Webhook', JSON.stringify(w.steps || []), req.user.id);
      createdRefs.workflows.push({ id, name: w.name });
    }
    db.prepare('INSERT INTO marketplace_installations (id, workspace_id, item_id, installed_by) VALUES (?, ?, ?, ?)').run(uuid(), req.workspace.id, item.id, req.user.id);
    db.prepare('UPDATE marketplace_items SET installs = installs + 1 WHERE id = ?').run(item.id);
  });
  tx();

  logger.info('marketplace', `Installed "${item.name}": ${createdRefs.agents.length} agents, ${createdRefs.workflows.length} workflows`, { workspaceId: req.workspace.id, userId: req.user.id });
  res.json({ ok: true, created: createdRefs });
});

router.delete('/:slug/install', requireAuth, requireWorkspace, requireRole('owner', 'admin'), (req, res) => {
  const item = db.prepare('SELECT id FROM marketplace_items WHERE slug = ?').get(req.params.slug);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM marketplace_installations WHERE workspace_id = ? AND item_id = ?').run(req.workspace.id, item.id);
  res.json({ ok: true });
});

export default router;
