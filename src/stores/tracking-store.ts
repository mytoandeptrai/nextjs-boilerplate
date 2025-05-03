import { createSelectorFunctions } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

export interface ITrackingStore {
  refreshNumber: number;
  shouldRefresh: () => void;
}

const useBaseTrackingStore = create<ITrackingStore>()((set) => ({
  refreshNumber: 0,
  shouldRefresh: () => set((state) => ({ refreshNumber: state.refreshNumber + 1 })),
}));

export const useTrackingStore = createSelectorFunctions(useBaseTrackingStore);
