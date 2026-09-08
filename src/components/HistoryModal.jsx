import Modal from './Modal';
import { Check, X, MinusCircle, Trash2 } from 'lucide-react';
import { formatKeyNice } from '../lib/date';
import { percentage } from '../lib/attendance';

const STATUS_META = {
  present: { icon: Check, label: 'Present', cls: 'text-accent' },
  absent: { icon: X, label: 'Absent', cls: 'text-danger' },
  cancelled: { icon: MinusCircle, label: 'No class', cls: 'text-content-faint' },
};

export default function HistoryModal({ subject, onClose, onMark }) {
  const entries = [...subject.log].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Modal
      title={`${subject.emoji ? subject.emoji + ' ' : ''}${subject.name}`}
      subtitle={`${subject.attended}/${subject.total} held · ${Math.round(
        percentage(subject.attended, subject.total),
      )}%`}
      onClose={onClose}
    >
      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-content-faint">
          No dated marks yet. Use “Mark today” on the card or the Today tab.
        </p>
      ) : (
        <ul className="divide-y divide-content/[0.07]">
          {entries.map((e) => {
            const meta = STATUS_META[e.status];
            const Icon = meta.icon;
            return (
              <li key={e.date} className="flex items-center gap-3 py-2.5">
                <Icon className={`h-4 w-4 shrink-0 ${meta.cls}`} />
                <span className="flex-1 text-sm font-medium text-content">{formatKeyNice(e.date)}</span>
                <div className="flex gap-1">
                  {Object.entries(STATUS_META).map(([key, m]) => {
                    const I = m.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => onMark(subject.id, e.date, key)}
                        className={`rounded-md p-1.5 transition ${
                          e.status === key ? `bg-content/10 ${m.cls}` : 'text-content-faint hover:text-content'
                        }`}
                        aria-label={m.label}
                      >
                        <I className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onMark(subject.id, e.date, null)}
                    className="rounded-md p-1.5 text-content-faint hover:text-danger"
                    aria-label="Remove entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-xs text-content-faint">
        Editing an entry updates the attended / held counts automatically. “No class” entries
        don’t count toward either.
      </p>
    </Modal>
  );
}
