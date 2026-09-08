// Pure attendance math. Thresholds are percentages (0-100).

export function percentage(attended, total) {
  return total > 0 ? (attended / total) * 100 : 0;
}

export function roundPct(value) {
  return Math.round(value * 10) / 10;
}

export function subjectThreshold(subject, settings) {
  const t = subject?.threshold;
  if (t === null || t === undefined || Number.isNaN(t)) {
    return settings?.defaultThreshold ?? 75;
  }
  return t;
}

// Binary fractions like 0.8 can't be represented exactly, so (0.8*10-5)/(1-0.8)
// evaluates to 15.000000000000004 and a bare Math.ceil would demand 16 classes.
// Every ceil/floor below is nudged by this tolerance first.
const EPS = 1e-9;

// Consecutive classes you must attend from now to reach the threshold.
export function classesToRecover(attended, total, thresholdPct) {
  const t = thresholdPct / 100;
  if (total === 0) return 0;
  if (t >= 1) return Infinity;
  if (attended >= t * total - EPS) return 0;
  return Math.max(0, Math.ceil((t * total - attended) / (1 - t) - EPS));
}

// Consecutive classes you can skip from now and still stay at/above threshold.
export function classesCanSkip(attended, total, thresholdPct) {
  const t = thresholdPct / 100;
  if (total === 0) return 0;
  if (t <= 0) return Infinity;
  if (attended < t * total - EPS) return 0;
  return Math.max(0, Math.floor(attended / t - total + EPS));
}

// Best % reachable if every remaining class (up to expectedTotal) is attended.
export function bestPossible(attended, total, expectedTotal) {
  if (!expectedTotal || expectedTotal <= total) return percentage(attended, total);
  return percentage(attended + (expectedTotal - total), expectedTotal);
}

// Minimum of the remaining classes you still need to attend to finish >= threshold.
export function neededByTermEnd(attended, total, expectedTotal, thresholdPct) {
  if (!expectedTotal || expectedTotal <= total) return 0;
  const remaining = expectedTotal - total;
  const y = Math.ceil((thresholdPct / 100) * expectedTotal - attended - EPS);
  return Math.max(0, Math.min(remaining, y));
}

export function statusOf(pct, thresholdPct) {
  if (pct >= thresholdPct - EPS) return 'good';
  if (pct >= thresholdPct - 10) return 'warn';
  return 'danger';
}

export const STATUS_COLOR = {
  good: '#22c55e',
  warn: '#f59e0b',
  danger: '#ef4444',
};

// Advice line for a card.
export function advice(attended, total, thresholdPct) {
  const pct = percentage(attended, total);
  if (total === 0) return { text: 'No classes recorded yet', tone: 'muted' };
  if (pct >= thresholdPct - EPS) {
    const skip = classesCanSkip(attended, total, thresholdPct);
    return {
      text: skip > 0 ? `You can skip ${skip} class${skip === 1 ? '' : 'es'}` : 'On the edge — don’t skip',
      tone: skip > 0 ? 'good' : 'warn',
    };
  }
  const need = classesToRecover(attended, total, thresholdPct);
  return {
    text: need === Infinity
      ? 'Threshold set to 100% — attend every class'
      : `Attend ${need} class${need === 1 ? '' : 'es'} to reach ${thresholdPct}%`,
    tone: 'danger',
  };
}

// Cumulative attendance % over time, built from every subject's dated log.
export function trendSeries(subjects) {
  const events = [];
  for (const s of subjects) {
    for (const e of s.log || []) {
      if (e.status === 'present' || e.status === 'absent') {
        events.push({ date: e.date, present: e.status === 'present' ? 1 : 0 });
      }
    }
  }
  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let attended = 0;
  let total = 0;
  const byDate = new Map();
  for (const ev of events) {
    attended += ev.present;
    total += 1;
    byDate.set(ev.date, roundPct(percentage(attended, total)));
  }
  return [...byDate.entries()].map(([date, pct]) => ({ date, pct }));
}
