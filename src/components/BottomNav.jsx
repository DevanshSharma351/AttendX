import { LayoutGrid, CalendarCheck, BarChart3, Plus } from 'lucide-react';

const TABS = [
  { key: 'subjects', label: 'Subjects', icon: LayoutGrid },
  { key: 'today', label: 'Today', icon: CalendarCheck },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
];

export default function BottomNav({ tab, onTab, onAdd }) {
  const index = TABS.findIndex((t) => t.key === tab);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] sm:px-4">
      <div className="glass-panel flex max-w-full items-center gap-1 rounded-full p-1.5 shadow-2xl">
        {/* Equal-width grid so the sliding indicator lands exactly on each tab. */}
        <div className="relative grid min-w-0 grid-cols-3">
          <span
            aria-hidden
            className="btn-accent absolute inset-y-0 left-0 w-1/3 rounded-full"
            style={{
              transform: `translateX(${index * 100}%)`,
              transition: 'transform 0.42s cubic-bezier(0.34, 1.35, 0.64, 1)',
            }}
          />
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTab(key)}
              className={`relative z-10 flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-2.5 text-[11px] font-bold transition-colors duration-300 sm:gap-1.5 sm:px-3.5 sm:text-[13px] ${
                tab === key ? 'text-white' : 'text-content-muted hover:text-content'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {/* Labels would collide below ~360px; icons carry it there. */}
              <span className="truncate max-[359px]:hidden">{label}</span>
            </button>
          ))}
        </div>

        <span aria-hidden className="mx-0.5 h-6 w-px bg-content/10" />

        <button
          onClick={onAdd}
          className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-content text-canvas sm:h-11 sm:w-11"
          aria-label="Add subject"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
