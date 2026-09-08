// Date helpers — everything keyed by local "YYYY-MM-DD" strings.

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function keyToDate(key) {
  return new Date(`${key}T00:00:00`);
}

export function weekdayOfKey(key) {
  return keyToDate(key).getDay();
}

export function addDays(key, n) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function formatFull(d = new Date()) {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatKeyNice(key) {
  const today = dayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  return keyToDate(key).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export function formatTime(d = new Date()) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
