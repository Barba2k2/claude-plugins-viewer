'use client';

import { create } from 'zustand';

type ResourceFilterState = {
  query: string;
  pluginFilter: string | null;
  extraFilter: string | null;
  setQuery: (q: string) => void;
  setPluginFilter: (p: string | null) => void;
  setExtraFilter: (e: string | null) => void;
  reset: () => void;
};

export const useResourceFilterStore = create<ResourceFilterState>((set) => ({
  query: '',
  pluginFilter: null,
  extraFilter: null,
  setQuery: (query) => set({ query }),
  setPluginFilter: (pluginFilter) => set({ pluginFilter }),
  setExtraFilter: (extraFilter) => set({ extraFilter }),
  reset: () => set({ query: '', pluginFilter: null, extraFilter: null }),
}));
