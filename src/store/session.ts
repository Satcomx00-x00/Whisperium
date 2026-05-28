import { create } from 'zustand';

type SessionStatus = 'idle' | 'recording' | 'transcribing' | 'error';

type SessionState = {
  status: SessionStatus;
  lastTranscript: string | null;
  setStatus: (status: SessionStatus) => void;
  setLastTranscript: (text: string) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  lastTranscript: null,
  setStatus: (status) => set({ status }),
  setLastTranscript: (text) => set({ lastTranscript: text }),
}));
