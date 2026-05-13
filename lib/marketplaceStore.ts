import { create } from 'zustand';

type MarketplaceState = {
  addInput: string;
  addPending: boolean;
  addError: string | null;
  addSuccess: string | null;

  removePending: Record<string, boolean>;
  removeError: Record<string, string | null>;
  confirmingRemove: Record<string, boolean>;

  updatePending: Record<string, boolean>;
  updateError: Record<string, string | null>;
  updateSuccess: Record<string, string | null>;

  setAddInput: (v: string) => void;
  setAddPending: (v: boolean) => void;
  setAddError: (v: string | null) => void;
  setAddSuccess: (v: string | null) => void;

  setRemovePending: (id: string, v: boolean) => void;
  setRemoveError: (id: string, v: string | null) => void;
  setConfirmingRemove: (id: string, v: boolean) => void;

  setUpdatePending: (id: string, v: boolean) => void;
  setUpdateError: (id: string, v: string | null) => void;
  setUpdateSuccess: (id: string, v: string | null) => void;
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  addInput: '',
  addPending: false,
  addError: null,
  addSuccess: null,

  removePending: {},
  removeError: {},
  confirmingRemove: {},

  updatePending: {},
  updateError: {},
  updateSuccess: {},

  setAddInput: (v) => set({ addInput: v }),
  setAddPending: (v) => set({ addPending: v }),
  setAddError: (v) => set({ addError: v }),
  setAddSuccess: (v) => set({ addSuccess: v }),

  setRemovePending: (id, v) =>
    set((s) => ({ removePending: { ...s.removePending, [id]: v } })),
  setRemoveError: (id, v) =>
    set((s) => ({ removeError: { ...s.removeError, [id]: v } })),
  setConfirmingRemove: (id, v) =>
    set((s) => ({ confirmingRemove: { ...s.confirmingRemove, [id]: v } })),

  setUpdatePending: (id, v) =>
    set((s) => ({ updatePending: { ...s.updatePending, [id]: v } })),
  setUpdateError: (id, v) =>
    set((s) => ({ updateError: { ...s.updateError, [id]: v } })),
  setUpdateSuccess: (id, v) =>
    set((s) => ({ updateSuccess: { ...s.updateSuccess, [id]: v } })),
}));
