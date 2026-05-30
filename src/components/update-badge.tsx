import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useRef, useState } from 'react';

import { InfoIcon } from '@/components/icons';
import { useUpdateStore } from '@/store/update';

type TooltipRow = { label: string; value: string };

const Row = ({ label, value }: TooltipRow) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-white/45 text-[10px] uppercase tracking-wider">{label}</span>
    <span className="font-mono text-[11px] text-white/85">{value}</span>
  </div>
);

export function UpdateBadge() {
  const [open, setOpen] = useState(false);
  const [runningVersion, setRunningVersion] = useState<string>('…');
  const available = useUpdateStore((s) => s.available);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getVersion()
      .then(setRunningVersion)
      .catch(() => {});
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hasUpdate = available !== null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Version info"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-6 w-6 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white/90"
      >
        <InfoIcon />
        {hasUpdate && (
          <span
            aria-label="Update available"
            className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-sky-400"
          />
        )}
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border border-white/10 bg-zinc-900/95 px-3 py-2.5 shadow-2xl backdrop-blur-md"
        >
          <div className="flex flex-col gap-1.5">
            <Row label="Version" value={`v${runningVersion}`} />
            <Row label="Built" value={__BUILD_DATE__} />
            <Row label="Commit" value={__COMMIT_SHA__} />

            {hasUpdate ? (
              <>
                <div className="my-1 h-px bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span className="text-[11px] text-sky-400">Update available</span>
                </div>
                <Row label="Latest" value={`v${available.version}`} />
                {available.date && <Row label="Released" value={available.date.slice(0, 10)} />}
              </>
            ) : (
              <>
                <div className="my-1 h-px bg-white/10" />
                <span className="text-[11px] text-white/40">Up to date</span>
              </>
            )}
          </div>

          {/* Tooltip caret */}
          <div className="absolute -bottom-1.5 right-2.5 h-3 w-3 rotate-45 rounded-sm border-r border-b border-white/10 bg-zinc-900/95" />
        </div>
      )}
    </div>
  );
}
