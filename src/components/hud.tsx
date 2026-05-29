import { useEffect } from 'react';

import { MicIcon, PauseIcon, PinIcon, SettingsIcon } from '@/components/icons';
import { Waveform } from '@/components/waveform';
import { useAudioLevels } from '@/hooks/use-audio-levels';
import { useSessionStore } from '@/store/session';

type IconButtonProps = {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
};

const IconButton = ({ label, onClick, children }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="flex h-6 w-6 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white/90"
  >
    {children}
  </button>
);

export function Hud() {
  const status = useSessionStore((s) => s.status);
  const device = useSessionStore((s) => s.device);
  const stop = useSessionStore((s) => s.stop);
  const cancel = useSessionStore((s) => s.cancel);

  const isRecording = status === 'recording';
  const levels = useAudioLevels(isRecording);

  // esc cancels the session, matching the `esc` affordance in the controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div className="flex w-[440px] flex-col gap-1 rounded-2xl border border-white/10 bg-zinc-900/85 px-4 pt-3 pb-2 text-white shadow-2xl backdrop-blur-md">
        <Waveform levels={levels} />

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-white/55 transition-colors hover:text-white/90"
            title="Input device"
          >
            <MicIcon />
            <span className="font-medium">{device}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stop}
              disabled={status === 'transcribing'}
              className="font-medium text-white/80 transition-colors hover:text-white disabled:opacity-40"
            >
              {status === 'transcribing' ? 'Transcribing…' : 'Stop'}
            </button>

            <span className="h-3 w-px bg-white/15" aria-hidden="true" />

            <div className="flex items-center gap-0.5">
              <IconButton label="Keep on top">
                <PinIcon />
              </IconButton>
              <IconButton label="Pause microphone">
                <PauseIcon />
              </IconButton>
              <IconButton label="Settings">
                <SettingsIcon />
              </IconButton>
            </div>

            <span className="h-3 w-px bg-white/15" aria-hidden="true" />

            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1.5 text-white/55 transition-colors hover:text-white/90"
            >
              <span>Cancel</span>
              <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] text-white/60">
                esc
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
