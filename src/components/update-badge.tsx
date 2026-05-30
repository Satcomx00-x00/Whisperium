import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { InfoIcon } from '@/components/icons';
import { useUpdateStore } from '@/store/update';

type TooltipRow = { label: string; value: string };

const Row = ({ label, value }: TooltipRow) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="shrink-0 text-[10px] uppercase tracking-widest text-white/40">{label}</span>
    <span className="truncate font-mono text-[11px] text-white/90">{value}</span>
  </div>
);

const Divider = () => <div className="h-px bg-white/10" />;

type AnchorRect = { bottom: number; right: number };

export function UpdateBadge() {
  const [open, setOpen] = useState(false);
  const [runningVersion, setRunningVersion] = useState<string>('…');
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const available = useUpdateStore((s) => s.available);
  const hasUpdate = available !== null;

  useEffect(() => {
    getVersion()
      .then(setRunningVersion)
      .catch(() => {});
  }, []);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setAnchor({ bottom: r.bottom, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tooltip =
    open && anchor
      ? createPortal(
          <div
            role="tooltip"
            style={{ top: anchor.bottom + 8, right: anchor.right - 4 }}
            className="fixed z-50 w-56 rounded-xl border border-white/12 bg-zinc-950/96 px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/5"
          >
            {/* Caret pointing up */}
            <div
              style={{ right: 10 }}
              className="absolute -top-1.5 h-3 w-3 rotate-45 rounded-sm border-l border-t border-white/12 bg-zinc-950/96"
            />

            <div className="flex flex-col gap-2">
              <Row label="Version" value={`v${runningVersion}`} />
              <Row label="Built" value={__BUILD_DATE__} />
              <Row label="Commit" value={__COMMIT_SHA__} />

              <Divider />

              {hasUpdate ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_6px_var(--color-sky-400)]" />
                    <span className="text-[11px] font-medium text-sky-400">Update available</span>
                  </div>
                  <Row label="Latest" value={`v${available.version}`} />
                  {available.date && <Row label="Released" value={available.date.slice(0, 10)} />}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-white/50">Up to date</span>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Version info"
        aria-expanded={open}
        onClick={toggle}
        className="relative flex h-6 w-6 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white/90"
      >
        <InfoIcon />
        {hasUpdate && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_4px_var(--color-sky-400)]"
          />
        )}
      </button>

      {tooltip}
    </>
  );
}
