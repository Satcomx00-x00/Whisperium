import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import { MicIcon, PauseIcon, PinIcon, SettingsIcon } from '@/components/icons';
import { UpdateBadge } from '@/components/update-badge';
import { Waveform } from '@/components/waveform';
import { useAudioLevels } from '@/hooks/use-audio-levels';
import { useSessionStore } from '@/store/session';
import { useUpdateStore } from '@/store/update';
import type { UpdateInfo } from '@/store/update';

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
  const deviceId = useSessionStore((s) => s.deviceId);
  const devices = useSessionStore((s) => s.devices);
  const setDevice = useSessionStore((s) => s.setDevice);
  const setDevices = useSessionStore((s) => s.setDevices);
  const stop = useSessionStore((s) => s.stop);
  const cancel = useSessionStore((s) => s.cancel);
  const setUpdateAvailable = useUpdateStore((s) => s.setAvailable);

  const isRecording = status === 'recording';
  const levels = useAudioLevels(isRecording);

  // Subscribe to the update-available event emitted by the Rust updater check.
  useEffect(() => {
    const unlisten = listen<UpdateInfo>('update://available', (event) => {
      setUpdateAvailable(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setUpdateAvailable]);

  // Enumerate audio input devices once on mount. Labels require a prior
  // getUserMedia grant; on first run they may be empty strings.
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((infos) => {
        const inputs = infos
          .filter((d) => d.kind === 'audioinput')
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${i + 1}`,
          }));
        setDevices(inputs);
      })
      .catch(() => {});
  }, [setDevices]);

  // Esc cancels the session.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancel]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent"
      data-tauri-drag-region
    >
      <div className="flex w-110 flex-col gap-1 rounded-2xl border border-white/10 bg-zinc-900/85 px-4 pt-3 pb-2 text-white shadow-2xl backdrop-blur-md">
        <Waveform levels={levels} />

        <div className="flex items-center justify-between text-xs">
          {/* Microphone picker */}
          <label className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-white/55 transition-colors hover:text-white/90 cursor-pointer">
            <MicIcon />
            <select
              value={deviceId}
              onChange={(e) => {
                const selected = devices.find((d) => d.deviceId === e.target.value);
                if (selected) setDevice(selected.deviceId, selected.label);
              }}
              className="cursor-pointer appearance-none bg-transparent font-medium text-inherit outline-none"
              aria-label="Microphone input device"
            >
              {devices.length === 0 ? (
                <option value="default">{device}</option>
              ) : (
                devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))
              )}
            </select>
          </label>

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
              <UpdateBadge />
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
