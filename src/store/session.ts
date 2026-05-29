import { create } from 'zustand';

type SessionStatus = 'idle' | 'recording' | 'transcribing' | 'error';

type SessionState = {
  status: SessionStatus;
  device: string;
  lastTranscript: string | null;
  setStatus: (status: SessionStatus) => void;
  setDevice: (device: string) => void;
  setLastTranscript: (text: string) => void;
  start: () => void;
  stop: () => void;
  cancel: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  device: 'Default',
  lastTranscript: null,
  setStatus: (status) => set({ status }),
  setDevice: (device) => set({ device }),
  setLastTranscript: (text) => set({ lastTranscript: text }),
  // Lifecycle transitions used by the HUD controls. `stop` hands off to
  // transcription; `cancel` (esc) aborts back to idle without transcribing.
  start: () => set({ status: 'recording' }),
  stop: () => set({ status: 'transcribing' }),
  cancel: () => set({ status: 'idle' }),
}));
