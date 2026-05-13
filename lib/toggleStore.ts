import { create } from 'zustand';

type ToggleState = {
  optimistic: Record<string, boolean>;
  pending: Record<string, boolean>;
  errors: Record<string, string | null>;
  setOptimistic: (key: string, value: boolean) => void;
  setPending: (key: string, value: boolean) => void;
  setError: (key: string, value: string | null) => void;
  clear: (key: string) => void;
};

export const useToggleStore = create<ToggleState>((set) => ({
  optimistic: {},
  pending: {},
  errors: {},
  setOptimistic: (key, value) => set((s) => ({ optimistic: { ...s.optimistic, [key]: value } })),
  setPending: (key, value) => set((s) => ({ pending: { ...s.pending, [key]: value } })),
  setError: (key, value) => set((s) => ({ errors: { ...s.errors, [key]: value } })),
  clear: (key) =>
    set((s) => {
      const nextO = { ...s.optimistic };
      const nextP = { ...s.pending };
      const nextE = { ...s.errors };
      delete nextO[key];
      delete nextP[key];
      delete nextE[key];
      return { optimistic: nextO, pending: nextP, errors: nextE };
    }),
}));

export function readOptimistic(key: string, fallback: boolean): boolean {
  const stored = useToggleStore.getState().optimistic[key];
  return stored === undefined ? fallback : stored;
}
