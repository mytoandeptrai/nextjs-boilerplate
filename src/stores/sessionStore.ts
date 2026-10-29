import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

export interface ISessionStore {
  /** Bumps whenever the identity changes, so caches can be invalidated (see QueryClientProvider). */
  sessionRevision: number;
  startSession: () => void;
  clearSession: () => void;
}

const useBaseSessionStore = create<ISessionStore>()((set) => ({
  sessionRevision: 0,
  startSession: () => set((state) => ({ sessionRevision: state.sessionRevision + 1 })),
  clearSession: () => set((state) => ({ sessionRevision: state.sessionRevision + 1 })),
}));

export const useSessionStore = createSelectorFunctions(useBaseSessionStore);
