import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import AttendanceCard from './components/AttendanceCard';
import AddSubjectModal from './components/AddSubjectModal';
import TodayView from './components/TodayView';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import HeroSummary from './components/HeroSummary';
import BottomNav from './components/BottomNav';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { load, save } from './lib/storage';
import { setMark, adjustCounts } from './lib/subjectOps';
import { percentage, subjectThreshold } from './lib/attendance';
import { formatTime, WEEKDAYS_LONG } from './lib/date';

// Charts (recharts) are a large dependency — only pulled in when Stats is opened.
const OverallStats = lazy(() => import('./components/OverallStats'));

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function App() {
  const toast = useToast();
  const [data, setData] = useState(load);
  const [tab, setTab] = useState('subjects');
  const [modal, setModal] = useState(null); // {type:'add'|'edit'|'settings'|'history', subject?}
  const [savedAt, setSavedAt] = useState(null);
  const saveTimer = useRef(null);

  useTheme(data.settings.theme);

  // Debounced persistence. Runs once on mount too, so a migrated schema is
  // written back to storage in its new shape.
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const res = save(data);
      if (res.ok) setSavedAt(new Date());
      else toast.show(res.error, { tone: 'danger', duration: 8000 });
    }, 350);
    return () => clearTimeout(saveTimer.current);
  }, [data, toast]);

  const { subjects, settings } = data;

  const setSettings = (patch) =>
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  const mutate = (id, fn) =>
    setData((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === id ? fn(s) : s)) }));

  const handleMark = (id, date, status) => mutate(id, (s) => setMark(s, date, status));
  const handleAdjust = (id, dA, dT) => mutate(id, (s) => adjustCounts(s, dA, dT));

  const handleSubmitSubject = (payload) => {
    setData((d) => {
      if (modal?.type === 'edit') {
        return {
          ...d,
          subjects: d.subjects.map((s) => (s.id === modal.subject.id ? { ...s, ...payload } : s)),
        };
      }
      return {
        ...d,
        subjects: [...d.subjects, { ...payload, id: Date.now() + Math.random(), log: payload.log ?? [] }],
      };
    });
    setModal(null);
  };

  const handleDelete = (subject) => {
    const index = subjects.findIndex((s) => s.id === subject.id);
    setData((d) => ({ ...d, subjects: d.subjects.filter((s) => s.id !== subject.id) }));
    toast.show(`Deleted “${subject.name}”`, {
      actionLabel: 'Undo',
      duration: 6000,
      onAction: () =>
        setData((d) => {
          const next = [...d.subjects];
          next.splice(Math.min(index, next.length), 0, subject);
          return { ...d, subjects: next };
        }),
    });
  };

  const handleMove = (id, dir) => {
    setData((d) => {
      const arr = [...d.subjects];
      const i = arr.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, subjects: arr };
    });
  };

  const sortBy = settings.sortBy;
  const sorted = useMemo(() => {
    const arr = [...subjects];
    const pctOf = (s) => percentage(s.attended, s.total);
    if (sortBy === 'lowest') arr.sort((a, b) => pctOf(a) - pctOf(b));
    else if (sortBy === 'highest') arr.sort((a, b) => pctOf(b) - pctOf(a));
    else if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [subjects, sortBy]);

  const manualOrder = sortBy === 'manual';
  const now = new Date();

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="aurora">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:pt-12">
        {/* Masthead */}
        <header className="mb-7 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-label text-content-faint">
              {WEEKDAYS_LONG[now.getDay()]} ·{' '}
              {now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
            </p>
            <h1 className="font-display mt-1.5 text-[34px] font-extrabold leading-[1.05] tracking-tight sm:text-[42px]">
              {greeting()}.
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-content-faint">
              <Sparkles className="h-3 w-3" />
              {savedAt ? `Saved ${formatTime(savedAt)}` : 'Everything stays on this device'}
            </p>
          </div>
          <button
            onClick={() => setModal({ type: 'settings' })}
            className="glass press mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-content-muted hover:text-content"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* Views — keyed so each entry replays its transition */}
        <div key={tab} className="animate-fade-slide">
          {tab === 'subjects' && (
            subjects.length === 0 ? (
              <EmptyState onAdd={() => setModal({ type: 'add' })} />
            ) : (
              <div className="space-y-4">
                <HeroSummary subjects={subjects} settings={settings} />

                <p className="px-1 pt-2 text-[10px] font-bold uppercase tracking-label text-content-faint">
                  Your subjects
                </p>

                {sorted.map((s, i) => (
                  <div key={s.id} className="rise" style={{ '--d': `${Math.min(i, 8) * 60 + 80}ms` }}>
                    <AttendanceCard
                      subject={s}
                      threshold={subjectThreshold(s, settings)}
                      onMark={handleMark}
                      onAdjust={handleAdjust}
                      onEdit={(subject) => setModal({ type: 'edit', subject })}
                      onDelete={handleDelete}
                      onHistory={(subject) => setModal({ type: 'history', subject })}
                      onMove={handleMove}
                      canMoveUp={manualOrder && i > 0}
                      canMoveDown={manualOrder && i < sorted.length - 1}
                    />
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'today' && (
            <TodayView
              subjects={subjects}
              settings={settings}
              onMark={handleMark}
              onGoToSubjects={() => setTab('subjects')}
            />
          )}

          {tab === 'stats' && (
            subjects.length === 0 ? (
              <EmptyState onAdd={() => setModal({ type: 'add' })} />
            ) : (
              <Suspense
                fallback={
                  <div className="glass rounded-[26px] p-12 text-center text-sm text-content-faint">
                    Loading charts…
                  </div>
                }
              >
                <OverallStats subjects={subjects} settings={settings} />
              </Suspense>
            )
          )}
        </div>
      </div>

      <BottomNav tab={tab} onTab={setTab} onAdd={() => setModal({ type: 'add' })} />

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <AddSubjectModal
          onClose={() => setModal(null)}
          onSubmit={handleSubmitSubject}
          editingSubject={modal.type === 'edit' ? modal.subject : null}
          defaultThreshold={settings.defaultThreshold}
        />
      )}
      {modal?.type === 'settings' && (
        <SettingsModal
          data={data}
          onClose={() => setModal(null)}
          onChange={setSettings}
          onDataReplaced={(next) => setData(next)}
          toast={toast}
        />
      )}
      {modal?.type === 'history' && (
        <HistoryModal
          subject={subjects.find((s) => s.id === modal.subject.id) ?? modal.subject}
          onClose={() => setModal(null)}
          onMark={handleMark}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="glass rise relative overflow-hidden rounded-[28px] p-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent opacity-20 blur-3xl"
      />
      <div className="relative">
        <p className="font-display text-[28px] font-extrabold leading-tight tracking-tight">
          Let’s set you up.
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-content-muted">
          Add your classes and AttendX works out how many you can safely miss.
        </p>
        <button
          onClick={onAdd}
          className="btn-accent press mt-6 rounded-full px-6 py-3 text-sm font-bold"
        >
          Add your first subject
        </button>
      </div>
    </div>
  );
}
