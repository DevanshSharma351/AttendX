// Pure helpers that transform a single subject.
// Counters (attended / total) stay canonical; dated log entries adjust them.

function deltaFor(status) {
  if (status === 'present') return { attended: 1, total: 1 };
  if (status === 'absent') return { attended: 0, total: 1 };
  return { attended: 0, total: 0 }; // cancelled / null
}

// Set (or clear, when status is null) the mark for one date on one subject.
export function setMark(subject, date, status) {
  const existing = subject.log.find((e) => e.date === date) || null;
  let { attended, total } = subject;

  if (existing) {
    const d = deltaFor(existing.status);
    attended -= d.attended;
    total -= d.total;
  }
  const log = subject.log.filter((e) => e.date !== date);

  if (status) {
    const d = deltaFor(status);
    attended += d.attended;
    total += d.total;
    log.push({ date, status });
  }

  log.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return {
    ...subject,
    log,
    attended: Math.max(0, attended),
    total: Math.max(0, total),
  };
}

// Manual correction that isn't tied to a date.
export function adjustCounts(subject, dAttended, dTotal) {
  let attended = Math.max(0, subject.attended + dAttended);
  let total = Math.max(0, subject.total + dTotal);
  if (total < attended) total = attended;
  return { ...subject, attended, total };
}
