import { useCallback, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { ToastContext } from '../hooks/useToast';

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { actionLabel, onAction, duration = 5000, tone = 'default' } = {}) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, actionLabel, onAction, tone }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-panel pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-content"
          >
            <span className="flex-1">{t.message}</span>
            {t.actionLabel && (
              <button
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide text-accent transition hover:bg-accent/10"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-lg p-1 text-content-faint hover:text-content"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
