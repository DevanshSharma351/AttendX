import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      style={{ backgroundColor: 'var(--scrim)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`glass-panel relative w-full ${maxWidth} max-h-[92dvh] animate-sheet-up overflow-y-auto rounded-t-[28px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:animate-scale-in sm:rounded-[28px] sm:p-7 sm:pb-7`}
      >
        {/* Grab handle — reads as a sheet on mobile. */}
        <div
          aria-hidden
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-content/20 sm:hidden"
        />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-content-faint transition hover:bg-content/[0.07] hover:text-content"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {title && (
          <h2 className="font-display pr-8 text-[26px] font-extrabold tracking-tight text-content">{title}</h2>
        )}
        {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
        <div className={title ? 'mt-5' : ''}>{children}</div>
      </div>
    </div>
  );
}
