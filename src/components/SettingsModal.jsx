import { useRef, useState } from 'react';
import { Download, Upload, Monitor, Sun, Moon, RotateCcw, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import { exportData, importData, listBackups, restoreBackup } from '../lib/storage';

export default function SettingsModal({ data, onClose, onChange, onDataReplaced, toast }) {
  const settings = data.settings;
  const fileRef = useRef(null);
  const [backups] = useState(() => listBackups());

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const merge = window.confirm(
        'OK = merge new subjects into your current data.\nCancel = replace everything with the file.',
      );
      const next = importData(text, { merge, liveData: data });
      onDataReplaced(next);
      toast.show(merge ? 'Data merged' : 'Data imported', { tone: 'good' });
      onClose();
    } catch {
      toast.show('That file could not be read as an AttendX backup.', { tone: 'danger' });
    } finally {
      e.target.value = '';
    }
  };

  const restore = (ts) => {
    if (!window.confirm('Restore this snapshot? Your current data is backed up first.')) return;
    const next = restoreBackup(ts);
    if (next) {
      onDataReplaced(next);
      toast.show('Snapshot restored', { tone: 'good' });
      onClose();
    }
  };

  const themes = [
    { key: 'system', icon: Monitor, label: 'System' },
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
  ];

  const sorts = [
    { key: 'manual', label: 'Manual order' },
    { key: 'lowest', label: 'Lowest %' },
    { key: 'highest', label: 'Highest %' },
    { key: 'name', label: 'Name' },
  ];

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="space-y-6">
        <section>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-label text-content-faint">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => onChange({ theme: key })}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold press ${
                  settings.theme === key
                    ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40'
                    : 'glass-soft text-content-muted hover:text-content'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-label text-content-faint">Default target</p>
            <span className="text-lg font-semibold tracking-tight text-content">{settings.defaultThreshold}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.defaultThreshold}
            onChange={(e) => onChange({ defaultThreshold: Number(e.target.value) })}
            className="range"
            style={{ '--val': `${settings.defaultThreshold}%` }}
          />
          <p className="mt-1 text-xs text-content-faint">
            Applied to subjects without their own custom target.
          </p>
        </section>

        <section>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-label text-content-faint">Sort subjects by</p>
          <div className="grid grid-cols-2 gap-2">
            {sorts.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onChange({ sortBy: key })}
                className={`rounded-xl px-3 py-2 text-sm font-semibold press ${
                  settings.sortBy === key
                    ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40'
                    : 'glass-soft text-content-muted hover:text-content'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-label text-content-faint">Backup &amp; restore</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                exportData(data);
                toast.show('Backup downloaded', { tone: 'good' });
              }}
              className="glass-soft flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-content transition hover:brightness-105 active:scale-[0.97]"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="glass-soft flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-content transition hover:brightness-105 active:scale-[0.97]"
            >
              <Upload className="h-4 w-4" /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-content-faint">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your data lives only in this browser. Export regularly, and to move to a new
            device or browser.
          </p>
        </section>

        {backups.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-label text-content-faint">Automatic snapshots</p>
            <ul className="space-y-1.5">
              {backups.map((b) => (
                <li
                  key={b.ts}
                  className="glass-soft flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                >
                  <span className="text-content-muted">
                    {new Date(b.ts).toLocaleString('en-US', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                    <span className="text-content-faint"> · {b.reason}</span>
                  </span>
                  <button
                    onClick={() => restore(b.ts)}
                    className="flex items-center gap-1 font-semibold text-accent"
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
