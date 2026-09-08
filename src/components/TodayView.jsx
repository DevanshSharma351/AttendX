import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, MinusCircle, CalendarDays } from 'lucide-react';
import { dayKey, addDays, weekdayOfKey, formatKeyNice, WEEKDAYS_LONG } from '../lib/date';
import { percentage, statusOf, STATUS_COLOR, subjectThreshold } from '../lib/attendance';

function Row({ subject, date, settings, onMark }) {
  const current = subject.log.find((e) => e.date === date)?.status ?? null;
  const t = subjectThreshold(subject, settings);
  const color = STATUS_COLOR[statusOf(percentage(subject.attended, subject.total), t)];
  const mark = (s) => onMark(subject.id, date, current === s ? null : s);
  const btn = (active, cls) =>
    `press flex h-10 w-10 items-center justify-center rounded-full ${
      active ? cls : 'glass-soft text-content-muted hover:text-content'
    }`;
  return (
    <div className="glass lift flex items-center gap-3 rounded-[22px] p-3">
      <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}66` }} />
      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-[15px] font-bold tracking-tight text-content">
          {subject.emoji && <span className="mr-1">{subject.emoji}</span>}
          {subject.name}
        </p>
        <p className="text-xs text-content-faint">
          {Math.round(percentage(subject.attended, subject.total))}% · {subject.attended}/{subject.total}
        </p>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => mark('present')} className={btn(current === 'present', 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40')} aria-label="Present">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => mark('absent')} className={btn(current === 'absent', 'bg-danger/15 text-danger ring-1 ring-inset ring-danger/40')} aria-label="Absent">
          <X className="h-4 w-4" />
        </button>
        <button onClick={() => mark('cancelled')} className={btn(current === 'cancelled', 'bg-content/10 text-content ring-1 ring-inset ring-content/25')} aria-label="No class">
          <MinusCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function TodayView({ subjects, settings, onMark, onGoToSubjects }) {
  const [date, setDate] = useState(dayKey());
  const weekday = weekdayOfKey(date);

  const scheduled = subjects.filter((s) => s.schedule.includes(weekday));
  const unscheduled = subjects.filter((s) => !s.schedule.includes(weekday));
  const isFuture = date > dayKey();

  const rowProps = { date, settings, onMark };

  return (
    <div className="space-y-5">
      <div className="glass rise flex items-center justify-between rounded-[22px] p-3">
        <button onClick={() => setDate((d) => addDays(d, -1))} className="rounded-full p-2 text-content-muted transition hover:bg-content/[0.07]" aria-label="Previous day">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-extrabold tracking-tight text-content">{formatKeyNice(date)}</p>
          <p className="text-[10px] font-bold uppercase tracking-label text-content-faint">{WEEKDAYS_LONG[weekday]}</p>
        </div>
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          disabled={isFuture}
          className="rounded-full p-2 text-content-muted transition hover:bg-content/[0.07] disabled:opacity-30"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {subjects.length === 0 ? (
        <Empty text="Add a subject first, then set its weekly schedule." onGoToSubjects={onGoToSubjects} />
      ) : scheduled.length === 0 ? (
        <div className="glass rise rounded-[22px] p-8 text-center">
          <CalendarDays className="mx-auto mb-2 h-8 w-8 text-content-faint" />
          <p className="text-sm text-content-muted">No classes scheduled for {WEEKDAYS_LONG[weekday]}.</p>
          <p className="mt-1 text-xs text-content-faint">
            Set a schedule from each subject’s Edit screen.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {scheduled.map((s) => (
            <Row key={s.id} subject={s} {...rowProps} />
          ))}
        </div>
      )}

      {unscheduled.length > 0 && subjects.length > 0 && (
        <details className="glass rounded-[22px] p-3">
          <summary className="cursor-pointer text-sm font-medium text-content-muted">
            Mark another subject ({unscheduled.length})
          </summary>
          <div className="mt-3 space-y-2.5">
            {unscheduled.map((s) => (
              <Row key={s.id} subject={s} {...rowProps} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Empty({ text, onGoToSubjects }) {
  return (
    <div className="glass rise rounded-[22px] p-8 text-center">
      <p className="text-sm text-content-muted">{text}</p>
      <button onClick={onGoToSubjects} className="btn-accent mt-3 rounded-xl px-4 py-2 text-sm font-bold transition active:scale-95">
        Go to subjects
      </button>
    </div>
  );
}
