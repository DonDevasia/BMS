const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const NOTIF_FILE = path.join(DATA_DIR, 'notifications.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(NOTIF_FILE)) {
  fs.writeFileSync(NOTIF_FILE, JSON.stringify([]));
}

function readLocalNotifs() {
  try {
    const raw = fs.readFileSync(NOTIF_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local notifications file:', err);
    return [];
  }
}

function writeLocalNotifs(notifs) {
  try {
    fs.writeFileSync(NOTIF_FILE, JSON.stringify(notifs.slice(-1000), null, 2));
  } catch (err) {
    console.error('Failed to write local notifications file:', err);
  }
}

async function addNotification(supabase, {
  customerId,
  title,
  message,
  type = 'info'
}) {
  const newNotif = {
    notification_id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    customer_id: customerId,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('notifications').insert([{
      customer_id: customerId,
      title,
      message,
      type,
      is_read: false
    }]);
    if (!error) return newNotif;
  } catch (err) {
    // Ignore and fallback
  }

  const list = readLocalNotifs();
  list.unshift(newNotif);
  writeLocalNotifs(list);
  return newNotif;
}

async function getCustomerNotifications(supabase, customerId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Fallback
  }

  const list = readLocalNotifs();
  return list.filter(n => n.customer_id === customerId);
}

async function markNotificationRead(supabase, notificationId, customerId) {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', notificationId)
      .eq('customer_id', customerId);
  } catch (err) {
    // Fallback
  }

  const list = readLocalNotifs();
  const target = list.find(n => n.notification_id === notificationId && n.customer_id === customerId);
  if (target) {
    target.is_read = true;
    writeLocalNotifs(list);
  }
  return true;
}

async function markAllNotificationsRead(supabase, customerId) {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('customer_id', customerId);
  } catch (err) {
    // Fallback
  }

  const list = readLocalNotifs();
  list.forEach(n => {
    if (n.customer_id === customerId) n.is_read = true;
  });
  writeLocalNotifs(list);
  return true;
}

module.exports = {
  addNotification,
  getCustomerNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
