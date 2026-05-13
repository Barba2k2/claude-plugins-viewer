import { create } from 'zustand';

type PluginActionState = {
  installInput: string;
  installPending: boolean;
  installError: string | null;
  installSuccess: string | null;

  uninstallPending: Record<string, boolean>;
  uninstallError: Record<string, string | null>;
  confirmingUninstall: Record<string, boolean>;

  updatePending: Record<string, boolean>;
  updateError: Record<string, string | null>;
  updateSuccess: Record<string, string | null>;

  setInstallInput: (v: string) => void;
  setInstallPending: (v: boolean) => void;
  setInstallError: (v: string | null) => void;
  setInstallSuccess: (v: string | null) => void;

  setUninstallPending: (id: string, v: boolean) => void;
  setUninstallError: (id: string, v: string | null) => void;
  setConfirmingUninstall: (id: string, v: boolean) => void;

  setUpdatePending: (id: string, v: boolean) => void;
  setUpdateError: (id: string, v: string | null) => void;
  setUpdateSuccess: (id: string, v: string | null) => void;
};

export const usePluginActionStore = create<PluginActionState>((set) => ({
  installInput: '',
  installPending: false,
  installError: null,
  installSuccess: null,

  uninstallPending: {},
  uninstallError: {},
  confirmingUninstall: {},

  updatePending: {},
  updateError: {},
  updateSuccess: {},

  setInstallInput: (v) => set({ installInput: v }),
  setInstallPending: (v) => set({ installPending: v }),
  setInstallError: (v) => set({ installError: v }),
  setInstallSuccess: (v) => set({ installSuccess: v }),

  setUninstallPending: (id, v) =>
    set((s) => ({ uninstallPending: { ...s.uninstallPending, [id]: v } })),
  setUninstallError: (id, v) => set((s) => ({ uninstallError: { ...s.uninstallError, [id]: v } })),
  setConfirmingUninstall: (id, v) =>
    set((s) => ({ confirmingUninstall: { ...s.confirmingUninstall, [id]: v } })),

  setUpdatePending: (id, v) => set((s) => ({ updatePending: { ...s.updatePending, [id]: v } })),
  setUpdateError: (id, v) => set((s) => ({ updateError: { ...s.updateError, [id]: v } })),
  setUpdateSuccess: (id, v) => set((s) => ({ updateSuccess: { ...s.updateSuccess, [id]: v } })),
}));
