const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(AUDIT_FILE)) {
  fs.writeFileSync(AUDIT_FILE, JSON.stringify([]));
}

function readLocalAuditLogs() {
  try {
    const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local audit file:', err);
    return [];
  }
}

function writeLocalAuditLogs(logs) {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs.slice(-1000), null, 2));
  } catch (err) {
    console.error('Failed to write local audit file:', err);
  }
}

async function logAudit(supabase, {
  actorId = null,
  actorEmail = 'system',
  actorRole = 'system',
  action,
  targetType = null,
  targetId = null,
  details = {},
  ipAddress = '127.0.0.1',
  status = 'success'
}) {
  const newLog = {
    log_id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    actor_id: actorId,
    actor_email: actorEmail,
    actor_role: actorRole,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    ip_address: ipAddress,
    status,
    created_at: new Date().toISOString()
  };

  // 1. Try Supabase
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      actor_id: actorId,
      actor_email: actorEmail,
      actor_role: actorRole,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
      status
    }]);
    if (!error) return newLog;
  } catch (err) {
    // Ignore and fallback to file store
  }

  // 2. Fallback to file storage
  const logs = readLocalAuditLogs();
  logs.unshift(newLog);
  writeLocalAuditLogs(logs);
  return newLog;
}

async function getAuditLogs(supabase, { limit = 100, action = null, search = null } = {}) {
  // Try Supabase first
  try {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (action) query = query.eq('action', action);
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Fallback to local
  }

  let logs = readLocalAuditLogs();
  if (action && action !== 'all') {
    logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    logs = logs.filter(l => 
      (l.action && l.action.toLowerCase().includes(s)) ||
      (l.actor_email && l.actor_email.toLowerCase().includes(s)) ||
      (l.target_id && l.target_id.toLowerCase().includes(s))
    );
  }
  return logs.slice(0, limit);
}

module.exports = {
  logAudit,
  getAuditLogs
};
