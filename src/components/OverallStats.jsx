import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area,
} from 'recharts';
import { TrendingUp, BookOpen, CheckCircle2, Layers, ShieldCheck } from 'lucide-react';
import {
  percentage, roundPct, subjectThreshold, statusOf, STATUS_COLOR,
  classesCanSkip, classesToRecover, trendSeries,
} from '../lib/attendance';
import { formatKeyNice } from '../lib/date';

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="glass rise rounded-[22px] p-4">
      <div className="flex items-center gap-2 text-content-faint">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-label">{label}</span>
      </div>
      <p className="font-display tnum mt-1.5 text-[32px] font-extrabold leading-none tracking-tight text-content">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-content-faint">{hint}</p>}
    </div>
  );
}

function BarTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-xs">
      <p className="font-display font-bold text-content">{d.fullName}</p>
      <p className="text-content-muted">{d.pct}% · {d.attended}/{d.total}</p>
      {d.needed > 0 && <p className="text-danger">attend {d.needed} more</p>}
    </div>
  );
}

function LineTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-content">{formatKeyNice(label)}</p>
      <p className="text-content-muted">{payload[0].value}% cumulative</p>
    </div>
  );
}

function buildBars(subjects, settings) {
  return subjects.map((s) => {
    const t = subjectThreshold(s, settings);
    const pct = percentage(s.attended, s.total);
    return {
      name: s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name,
      fullName: s.name,
      pct: roundPct(pct),
      attended: s.attended,
      total: s.total,
      threshold: t,
      canSkip: pct >= t ? classesCanSkip(s.attended, s.total, t) : 0,
      needed: pct < t ? classesToRecover(s.attended, s.total, t) : 0,
      status: statusOf(pct, t),
      color: STATUS_COLOR[statusOf(pct, t)],
    };
  });
}

export default function OverallStats({ subjects, settings }) {
  if (subjects.length === 0) return null;

  const totalAttended = subjects.reduce((s, x) => s + x.attended, 0);
  const totalHeld = subjects.reduce((s, x) => s + x.total, 0);
  const overall = roundPct(percentage(totalAttended, totalHeld));

  const bars = buildBars(subjects, settings);
  const safeBunks = bars.reduce((sum, b) => sum + b.canSkip, 0);
  const atRisk = bars.filter((b) => b.needed > 0).length;
  const trend = trendSeries(subjects);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={TrendingUp} label="Overall" value={`${overall}%`}
          hint={overall >= (settings.defaultThreshold ?? 75) ? 'above target' : 'below target'} />
        <Stat icon={BookOpen} label="Subjects" value={subjects.length}
          hint={atRisk ? `${atRisk} below target` : 'all on track'} />
        <Stat icon={CheckCircle2} label="Attended" value={totalAttended} hint={`of ${totalHeld} held`} />
        <Stat icon={ShieldCheck} label="Safe bunks" value={safeBunks}
          hint="across safe subjects" />
      </div>

      <div className="glass rise rounded-[22px] p-4">
        <h3 className="font-display mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-content">
          <Layers className="h-4 w-4" /> Subject-wise
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
              <defs>
                {Object.entries(STATUS_COLOR).map(([key, c]) => (
                  <linearGradient key={key} id={`bar-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={1} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.45} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-text) / 0.09)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: 'rgb(var(--c-text-faint))' }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: 'rgb(var(--c-text-faint))' }} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgb(var(--c-text) / 0.05)' }} />
              <Bar dataKey="pct" radius={[8, 8, 4, 4]} isAnimationActive={false} maxBarSize={54}>
                {bars.map((b, i) => (
                  <Cell key={i} fill={`url(#bar-${b.status})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trend.length >= 2 && (
        <div className="glass rise rounded-[22px] p-4">
          <h3 className="font-display mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-content">
            <TrendingUp className="h-4 w-4" /> Trend (from dated marks)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-text) / 0.09)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatKeyNice} tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: 'rgb(var(--c-text-faint))' }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false}
                  tick={{ fontSize: 11, fill: 'rgb(var(--c-text-faint))' }} />
                <Tooltip content={<LineTip />} />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#trend-fill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
