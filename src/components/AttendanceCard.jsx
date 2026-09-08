import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical, Pencil, History, ArrowUp, ArrowDown, Trash2,
  Check, X, MinusCircle, Minus, Plus,
} from 'lucide-react';
import {
  percentage, roundPct, advice, statusOf, STATUS_COLOR,
  bestPossible, neededByTermEnd,
} from '../lib/attendance';
import { dayKey } from '../lib/date';
import { useCountUp } from '../hooks/useCountUp';

export default function AttendanceCard({
  subject, threshold, onMark, onAdjust, onEdit, onDelete, onMove, onHistory, canMoveUp, canMoveDown,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const pct = percentage(subject.attended, subject.total);
  const status = statusOf(pct, threshold);
  const color = STATUS_COLOR[status];
  const tip = advice(subject.attended, subject.total, threshold);
  const shown = useCountUp(pct);

  const today = dayKey();
  const todayMark = subject.log.find((e) => e.date === today)?.status ?? null;
  const mark = (s) => onMark(subject.id, today, todayMark === s ? null : s);

  const remaining = subject.expectedTotal ? subject.expectedTotal - subject.total : 0;
  const best = remaining > 0
    ? roundPct(bestPossible(subject.attended, subject.total, subject.expectedTotal))
    : null;
  // When even a perfect run falls short, saying "attend N to finish at X%" would
  // be wrong — report the ceiling instead.
  const projection = best === null
    ? null
    : best < threshold
      ? `Even attending all ${remaining} remaining, you top out at ${best}%`
      : `Best possible ${best}% · attend ${neededByTermEnd(
          subject.attended, subject.total, subject.expectedTotal, threshold,
        )} of the last ${remaining} to finish at ${threshold}%`;

  const toneClass = {
    good: 'text-accent', warn: 'text-warn', danger: 'text-danger', muted: 'text-content-faint',
  }[tip.tone];

  const markBtn = (active, activeClass) =>
    `press flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-[13px] font-bold ${
      active ? activeClass : 'glass-soft text-content-muted hover:text-content'
    }`;

  return (
    <article className="glass lift relative overflow-hidden rounded-[26px] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full opacity-[0.18] blur-3xl"
        style={{ background: color }}
      />

      {/* Title row */}
      <div className="relative flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg"
          style={{ background: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}33` }}
        >
          {subject.emoji || subject.name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display truncate text-[17px] font-bold leading-tight tracking-tight">
            {subject.name}
          </h3>
          <p className="mt-0.5 text-xs text-content-muted">
            <span className="tnum font-semibold text-content">{subject.attended}</span>
            <span className="text-content-faint"> / </span>
            <span className="tnum">{subject.total}</span> attended
            {subject.total - subject.attended > 0 && (
              <span className="text-content-faint">
                {' · '}
                <span className="tnum">{subject.total - subject.attended}</span> missed
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <div className="text-right">
            <p
              className="font-display tnum text-[26px] font-extrabold leading-none tracking-tight"
              style={{ color }}
            >
              {Math.round(shown)}
              <span className="text-sm font-bold">%</span>
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="press -mr-1 rounded-full p-1 text-content-faint hover:text-content"
              aria-label="Subject menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="glass-panel absolute right-0 z-20 mt-1 w-44 origin-top-right animate-scale-in overflow-hidden rounded-2xl p-1">
                {[
                  { icon: Pencil, label: 'Edit', fn: () => onEdit(subject) },
                  { icon: History, label: 'History', fn: () => onHistory(subject) },
                  canMoveUp && { icon: ArrowUp, label: 'Move up', fn: () => onMove(subject.id, -1) },
                  canMoveDown && { icon: ArrowDown, label: 'Move down', fn: () => onMove(subject.id, 1) },
                  { icon: Trash2, label: 'Delete', fn: () => onDelete(subject), danger: true },
                ]
                  .filter(Boolean)
                  .map(({ icon: Icon, label, fn, danger }) => (
                    <button
                      key={label}
                      onClick={() => { setMenuOpen(false); fn(); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-content/[0.07] ${
                        danger ? 'text-danger' : 'text-content'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress track with the target marked on it */}
      <div className="relative mt-4">
        <div
          className="relative h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: 'var(--track)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, shown)}%`,
              background: `linear-gradient(90deg, ${color}b3, ${color})`,
              boxShadow: `0 0 12px ${color}66`,
            }}
          />
        </div>
        {/* Target tick */}
        <div
          className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-content/45"
          style={{ left: `calc(${threshold}% - 1px)` }}
          title={`Target ${threshold}%`}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className={`text-xs font-semibold ${toneClass}`}>{tip.text}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-faint">
            goal {threshold}%
          </span>
        </div>
        {projection && (
          <p className="mt-1 text-[11px] leading-relaxed text-content-faint">{projection}</p>
        )}
      </div>

      {/* Mark today */}
      <div className="relative mt-4 flex gap-2">
        <button
          onClick={() => mark('present')}
          className={markBtn(todayMark === 'present', 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40 animate-pop')}
        >
          <Check className="h-4 w-4" /> Present
        </button>
        <button
          onClick={() => mark('absent')}
          className={markBtn(todayMark === 'absent', 'bg-danger/15 text-danger ring-1 ring-inset ring-danger/40 animate-pop')}
        >
          <X className="h-4 w-4" /> Absent
        </button>
        <button
          onClick={() => mark('cancelled')}
          className={markBtn(todayMark === 'cancelled', 'bg-content/10 text-content ring-1 ring-inset ring-content/25 animate-pop')}
        >
          <MinusCircle className="h-4 w-4" /> Off
        </button>
      </div>

      <button
        onClick={() => setAdjustOpen((o) => !o)}
        className="relative mt-3 text-[11px] font-semibold text-content-faint/80 transition hover:text-content-muted"
      >
        {adjustOpen ? 'Hide manual adjustment' : 'Adjust manually'}
      </button>
      {adjustOpen && (
        <div className="relative mt-2 grid animate-fade-slide grid-cols-2 gap-2.5">
          {[
            { label: 'Attended', d: [1, 1], r: [-1, -1] },
            { label: 'Held only', d: [0, 1], r: [0, -1] },
          ].map(({ label, d, r }) => (
            <div key={label} className="glass-soft flex items-center justify-between rounded-2xl px-3 py-2">
              <span className="text-[11px] font-semibold text-content-muted">{label}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onAdjust(subject.id, r[0], r[1])}
                  className="press rounded-full p-1.5 text-content-muted hover:bg-content/10 hover:text-content"
                  aria-label={`Decrease ${label.toLowerCase()}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onAdjust(subject.id, d[0], d[1])}
                  className="press rounded-full p-1.5 text-content-muted hover:bg-content/10 hover:text-content"
                  aria-label={`Increase ${label.toLowerCase()}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
