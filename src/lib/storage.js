// Persistence + schema migration + backups.
//
// Storage layout has evolved:
//   v1  ->  a bare array: [{ id, name, attended, total }]
//   v2  ->  { version: 2, settings, subjects }
//   v3  ->  subjects gain: color, emoji, threshold, expectedTotal, schedule, log
//
// The primary key is kept as "attendanceData" so existing users' data is
// picked up untouched and migrated forward in place.

import { dayKey } from './date.js';

const KEY = 'attendanceData';
const BACKUP_KEY = 'attendx:backups';
const MAX_BACKUPS = 8;
export const SCHEMA_VERSION = 3;

export const DEFAULT_SETTINGS = {
  defaultThreshold: 75,
  theme: 'system', // 'system' | 'light' | 'dark'
  sortBy: 'manual', // 'manual' | 'lowest' | 'highest' | 'name'
};

const SUBJECT_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#ec4899',
  '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6',
];

export function pickColor(index) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}
export { SUBJECT_COLORS };

function normalizeSubject(raw, index) {
  const base = {
    id: raw?.id ?? Date.now() + index,
    name: typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Untitled',
    attended: Math.max(0, Math.floor(Number(raw?.attended) || 0)),
    total: Math.max(0, Math.floor(Number(raw?.total) || 0)),
    color: raw?.color || pickColor(index),
    emoji: typeof raw?.emoji === 'string' ? raw.emoji : '',
    threshold: raw?.threshold === undefined ? null : raw.threshold,
    expectedTotal:
      raw?.expectedTotal === undefined || raw?.expectedTotal === null
        ? null
        : Math.max(0, Math.floor(Number(raw.expectedTotal) || 0)) || null,
    schedule: Array.isArray(raw?.schedule)
      ? [...new Set(raw.schedule.map(Number).filter((n) => n >= 0 && n <= 6))]
      : [],
    log: Array.isArray(raw?.log)
      ? raw.log
          .filter((e) => e && typeof e.date === 'string' && ['present', 'absent', 'cancelled'].includes(e.status))
          .map((e) => ({ date: e.date, status: e.status }))
      : [],
  };
  if (base.total < base.attended) base.total = base.attended;
  return base;
}

export function migrate(raw) {
  let settings = { ...DEFAULT_SETTINGS };
  let subjects = [];

  if (Array.isArray(raw)) {
    subjects = raw;
  } else if (raw && typeof raw === 'object') {
    settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
    subjects = Array.isArray(raw.subjects) ? raw.subjects : [];
  }

  return {
    version: SCHEMA_VERSION,
    settings,
    subjects: subjects.map(normalizeSubject),
  };
}

function readRawString() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function load() {
  const rawStr = readRawString();
  if (!rawStr) return migrate(null);

  try {
    const parsed = JSON.parse(rawStr);
    const migrated = migrate(parsed);
    // If migration changed the on-disk shape, keep the pre-migration copy safe.
    if (JSON.stringify(migrated) !== rawStr) {
      pushBackup(rawStr, 'before migration');
    }
    return migrated;
  } catch {
    // Corrupt JSON — try the most recent backup before giving up.
    const backups = listBackups();
    for (const b of backups) {
      try {
        return migrate(JSON.parse(b.data));
      } catch {
        /* keep trying */
      }
    }
    // Last resort: stash whatever was there so it is never silently dropped.
    pushBackup(rawStr, 'unreadable data');
    return migrate(null);
  }
}

export function save(data) {
  const payload = JSON.stringify({
    version: SCHEMA_VERSION,
    settings: data.settings,
    subjects: data.subjects,
  });
  try {
    localStorage.setItem(KEY, payload);
    maybeDailyBackup(payload);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e && e.name === 'QuotaExceededError'
          ? 'Storage is full — export a backup and remove old subjects.'
          : 'Could not save your changes to this browser.',
    };
  }
}

/* ---------------- backups ---------------- */

export function listBackups() {
  try {
    const list = JSON.parse(localStorage.getItem(BACKUP_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// save() runs on every (debounced) change, so this must not re-parse the whole
// backup list each time — the newest timestamp is cached after the first read.
let lastBackupTs = null;
const DAY_MS = 24 * 60 * 60 * 1000;

export function pushBackup(dataStr, reason) {
  if (!dataStr) return;
  try {
    const list = listBackups();
    if (list[0] && list[0].data === dataStr) {
      lastBackupTs = list[0].ts; // identical content is already covered
      return;
    }
    const ts = Date.now();
    list.unshift({ ts, reason, data: dataStr });
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list.slice(0, MAX_BACKUPS)));
    lastBackupTs = ts;
  } catch {
    /* backups are best-effort */
  }
}

function maybeDailyBackup(payload) {
  if (lastBackupTs === null) {
    lastBackupTs = listBackups()[0]?.ts ?? 0;
  }
  if (Date.now() - lastBackupTs > DAY_MS) {
    pushBackup(payload, 'daily snapshot');
  }
}

export function restoreBackup(ts) {
  const b = listBackups().find((x) => x.ts === ts);
  if (!b) return null;
  pushBackup(readRawString() || '[]', 'before restore');
  try {
    const migrated = migrate(JSON.parse(b.data));
    save(migrated);
    return migrated;
  } catch {
    return null;
  }
}

/* ---------------- export / import ---------------- */

// Pass the live in-memory state so a just-made change (still inside the save
// debounce) is never missing from the backup file.
export function exportData(liveData) {
  const data = liveData ?? load();
  const blob = new Blob(
    [
      JSON.stringify(
        { app: 'AttendX', exportedAt: new Date().toISOString(), ...data },
        null,
        2,
      ),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendx-backup-${dayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importData(fileText, { merge = false, liveData = null } = {}) {
  const parsed = JSON.parse(fileText);
  const incoming = migrate(parsed);
  const current = liveData ?? load();
  pushBackup(JSON.stringify(current), 'before import');

  if (!merge) {
    save(incoming);
    return incoming;
  }

  const known = new Set(current.subjects.map((s) => s.name.toLowerCase()));
  const merged = {
    ...current,
    subjects: [
      ...current.subjects,
      ...incoming.subjects
        .filter((s) => !known.has(s.name.toLowerCase()))
        .map((s, i) => ({ ...s, id: Date.now() + i + Math.random() })),
    ],
  };
  save(merged);
  return merged;
}
