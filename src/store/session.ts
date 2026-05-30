import { create } from 'zustand';

type SessionStatus = 'idle' | 'recording' | 'transcribing' | 'error';

type AudioDevice = {
  deviceId: string;
  label: string;
};

type SessionState = {
  status: SessionStatus;
  device: string;
  deviceId: string;
  devices: AudioDevice[];
  lastTranscript: string | null;
  setStatus: (status: SessionStatus) => void;
  setDevice: (deviceId: string, label: string) => void;
  setDevices: (devices: AudioDevice[]) => void;
  setLastTranscript: (text: string) => void;
  start: () => void;
  stop: () => void;
  cancel: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  device: 'Default',
  deviceId: 'default',
  devices: [],
  lastTranscript: null,
  setStatus: (status) => set({ status }),
  setDevice: (deviceId, label) => set({ deviceId, device: label }),
  setDevices: (devices) => set({ devices }),
  setLastTranscript: (text) => set({ lastTranscript: text }),
  start: () => set({ status: 'recording' }),
  stop: () => set({ status: 'transcribing' }),
  cancel: () => set({ status: 'idle' }),
}));
