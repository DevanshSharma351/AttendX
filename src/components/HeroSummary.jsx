import { ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import {
  percentage, subjectThreshold, classesCanSkip, statusOf, STATUS_COLOR,
} from '../lib/attendance';
import { useCountUp } from '../hooks/useCountUp';

const R = 34;
const C = 2 * Math.PI * R;

function Pill({ icon: Icon, children }) {
  return (
    <span className="glass-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-content-muted">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export default function HeroSummary({ subjects, settings }) {
  const attended = subjects.reduce((s, x) => s + x.attended, 0);
  const held = subjects.reduce((s, x) => s + x.total, 0);
  const overall = percentage(attended, held);

  let safe = 0;
  let atRisk = 0;
  for (const s of subjects) {
    const t = subjectThreshold(s, settings);
    const p = percentage(s.attended, s.total);
    if (p >= t) safe += classesCanSkip(s.attended, s.total, t);
    else atRisk += 1;
  }

  const target = settings.defaultThreshold;
  const color = STATUS_COLOR[statusOf(overall, target)];
  const shown = useCountUp(overall);

  return (
    <section className="glass rise relative overflow-hidden rounded-[28px] p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: color }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-label text-content-faint">
            Overall attendance
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="font-display tnum text-[64px] font-extrabold leading-[0.85] tracking-tight"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              {Math.round(shown)}
            </span>
            <span className="font-display text-2xl font-bold text-content-muted">%</span>
          </div>
          <p className="mt-2 text-sm text-content-muted">
            <span className="tnum font-semibold text-content">{attended}</span> of{' '}
            <span className="tnum font-semibold text-content">{held}</span> classes attended
          </p>
        </div>

        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" strokeWidth="6"
              stroke="currentColor" className="text-content/[0.09]" />
            <circle
              cx="40" cy="40" r={R} fill="none" stroke={color}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (Math.min(100, shown) / 100) * C}
              style={{ filter: `drop-shadow(0 0 7px ${color}66)` }}
            />
            {/* Target notch, so the goal is visible on the dial itself. */}
            <circle
              cx="40" cy="40" r={R} fill="none" stroke="currentColor"
              className="text-content/40" strokeWidth="6" strokeLinecap="butt"
              strokeDasharray={`1.5 ${C}`}
              strokeDashoffset={-(target / 100) * C}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-faint">
              goal
            </span>
            <span className="tnum text-sm font-bold">{target}%</span>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Pill icon={Layers}>
          {subjects.length} subject{subjects.length === 1 ? '' : 's'}
        </Pill>
        <Pill icon={ShieldCheck}>{safe} safe to skip</Pill>
        {atRisk > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/15 px-3 py-1.5 text-xs font-semibold text-danger ring-1 ring-inset ring-danger/25">
            <AlertTriangle className="h-3.5 w-3.5" />
            {atRisk} below target
          </span>
        )}
      </div>
    </section>
  );
}
