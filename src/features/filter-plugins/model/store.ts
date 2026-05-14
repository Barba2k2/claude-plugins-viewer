'use client';

import { create } from 'zustand';

export type SortKey = 'name' | 'updated' | 'skills' | 'agents';

type FilterState = {
  query: string;
  marketplace: string | null;
  sort: SortKey;
  setQuery: (q: string) => void;
  setMarketplace: (m: string | null) => void;
  setSort: (s: SortKey) => void;
  reset: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  marketplace: null,
  sort: 'name',
  setQuery: (query) => set({ query }),
  setMarketplace: (marketplace) => set({ marketplace }),
  setSort: (sort) => set({ sort }),
  reset: () => set({ query: '', marketplace: null, sort: 'name' }),
}));
