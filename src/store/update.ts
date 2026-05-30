import { create } from 'zustand';

export type UpdateInfo = {
  version: string;
  date: string | null;
  body: string | null;
};

type UpdateState = {
  available: UpdateInfo | null;
  setAvailable: (info: UpdateInfo) => void;
};

export const useUpdateStore = create<UpdateState>((set) => ({
  available: null,
  setAvailable: (info) => set({ available: info }),
}));
