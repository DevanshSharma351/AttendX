import { useEffect, useRef, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Eases a number toward `value` on every change (and up from 0 on mount) so
 * percentages and counters roll rather than snap. Returns `value` unchanged
 * when the viewer prefers reduced motion.
 */
export function useCountUp(value, duration = 850) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const from = useRef(0);
  const shown = useRef(0); // where the number visually is right now
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) {
      from.current = value;
      shown.current = value;
      return undefined;
    }
    const start = from.current;
    if (start === value) return undefined;

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const next = start + (value - start) * eased;
      shown.current = next;
      setDisplay(next);
      if (t < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        from.current = value;
      }
    };
    raf.current = requestAnimationFrame(step);

    // rAF stops firing in background tabs (and can stall in embedded/headless
    // contexts), which would leave a real number frozen part-way. This is data,
    // not decoration, so guarantee it lands on the true value regardless.
    const land = setTimeout(() => {
      cancelAnimationFrame(raf.current);
      shown.current = value;
      from.current = value;
      setDisplay(value);
    }, duration + 150);

    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(land);
      // Resume from where the number actually is, never from the target —
      // parking it on the target makes the re-run bail out as a no-op and the
      // value stays stuck at its initial 0 (StrictMode remounts do exactly this).
      from.current = shown.current;
    };
  }, [value, duration, reduced]);

  return reduced ? value : display;
}
