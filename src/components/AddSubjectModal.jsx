import { useState } from 'react';
import Modal from './Modal';
import { SUBJECT_COLORS } from '../lib/storage';
import { WEEKDAYS } from '../lib/date';

const EMOJI_CHOICES = ['', '📐', '🧪', '💻', '📊', '🧬', '⚗️', '📖', '🎨', '🌍', '⚖️', '🩺', '🔬', '🎼'];

export default function AddSubjectModal({ onClose, onSubmit, editingSubject, defaultThreshold }) {
  const [form, setForm] = useState(() => ({
    name: editingSubject?.name ?? '',
    attended: editingSubject?.attended ?? 0,
    total: editingSubject?.total ?? 0,
    color: editingSubject?.color ?? SUBJECT_COLORS[0],
    emoji: editingSubject?.emoji ?? '',
    useCustomThreshold: editingSubject?.threshold != null,
    threshold: editingSubject?.threshold ?? defaultThreshold,
    expectedTotal: editingSubject?.expectedTotal ?? '',
    schedule: editingSubject?.schedule ?? [],
  }));
  const [error, setError] = useState('');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const num = (v) => Math.max(0, Math.floor(Number(v) || 0));

  const toggleDay = (d) =>
    set({
      schedule: form.schedule.includes(d)
        ? form.schedule.filter((x) => x !== d)
        : [...form.schedule, d].sort(),
    });

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Give the subject a name.');
    const attended = num(form.attended);
    let total = num(form.total);
    if (total < attended) total = attended;
    const expectedTotal = form.expectedTotal === '' ? null : num(form.expectedTotal);
    if (expectedTotal != null && expectedTotal < total) {
      return setError('Expected total classes can’t be less than classes held so far.');
    }
    onSubmit({
      name,
      attended,
      total,
      color: form.color,
      emoji: form.emoji,
      threshold: form.useCustomThreshold
        ? Math.min(100, Math.max(1, Math.round(Number(form.threshold) || defaultThreshold)))
        : null,
      expectedTotal,
      schedule: form.schedule,
    });
  };

  // No width here on purpose: Tailwind emits w-20 before w-full, so a shared
  // `w-full` would win over a per-element `w-20` no matter the class order.
  const field =
    'glass-soft rounded-xl px-4 py-3 text-content placeholder-content-faint outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30';
  const label =
    'mb-1.5 block text-[10px] font-bold uppercase tracking-label text-content-faint';

  return (
    <Modal
      title={editingSubject ? 'Edit subject' : 'Add subject'}
      subtitle="Track attendance, targets and the weekly schedule."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className={label}>
            Name <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={form.emoji}
              onChange={(e) => set({ emoji: e.target.value })}
              className={`${field} w-20 shrink-0 text-center`}
              aria-label="Icon"
            >
              {EMOJI_CHOICES.map((em) => (
                <option key={em} value={em}>
                  {em || '—'}
                </option>
              ))}
            </select>
            <input
              autoFocus
              name="name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g. Basic Electronics"
              className={`${field} w-full min-w-0`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Classes attended</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={form.attended}
              onChange={(e) => set({ attended: e.target.value })}
              className={`${field} w-full text-center font-semibold`}
            />
          </div>
          <div>
            <label className={label}>Classes held</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={form.total}
              onChange={(e) => set({ total: e.target.value })}
              className={`${field} w-full text-center font-semibold`}
            />
          </div>
        </div>

        <div>
          <label className={label}>Expected total this term (optional)</label>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.expectedTotal}
            onChange={(e) => set({ expectedTotal: e.target.value })}
            placeholder="Used for end-of-term projections"
            className={`${field} w-full text-center font-semibold`}
          />
        </div>

        <div className="glass-soft rounded-2xl p-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-content-muted">Custom target %</span>
            <input
              type="checkbox"
              checked={form.useCustomThreshold}
              onChange={(e) => set({ useCustomThreshold: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
          </label>
          {form.useCustomThreshold ? (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={form.threshold}
                onChange={(e) => set({ threshold: e.target.value })}
                className="range flex-1"
                style={{ '--val': `${form.threshold}%` }}
              />
              <span className="w-12 text-right font-bold text-content">{form.threshold}%</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-content-faint">
              Using the app default of {defaultThreshold}%.
            </p>
          )}
        </div>

        <div>
          <label className={label}>Weekly schedule (for the Today view)</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d, i) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(i)}
                className={`h-10 w-10 rounded-full text-xs font-bold press ${
                  form.schedule.includes(i)
                    ? 'btn-accent'
                    : 'glass-soft text-content-muted hover:text-content'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Colour</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => set({ color: c })}
                className={`h-8 w-8 rounded-full transition ${
                  form.color === c ? 'ring-2 ring-offset-2 ring-offset-surface' : ''
                }`}
                style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }}
                aria-label={`Colour ${c}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="glass-soft flex-1 rounded-2xl px-6 py-3.5 font-bold text-content-muted transition hover:text-content active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-accent flex-1 rounded-2xl px-6 py-3.5 font-bold transition hover:brightness-105 active:scale-[0.98]"
          >
            {editingSubject ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
