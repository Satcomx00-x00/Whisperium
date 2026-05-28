import { useSessionStore } from '@/store/session';

export function Hud() {
  const status = useSessionStore((s) => s.status);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div className="rounded-2xl bg-black/80 px-6 py-4 text-white backdrop-blur-sm">
        <p className="text-sm font-medium tracking-wide">
          {status === 'idle' && 'Press shortcut to start'}
          {status === 'recording' && '● Recording…'}
          {status === 'transcribing' && 'Transcribing…'}
          {status === 'error' && 'Error — check provider'}
        </p>
      </div>
    </div>
  );
}
