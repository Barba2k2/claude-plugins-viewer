import { create } from 'zustand';

type MemoryState = {
  drafts: Record<string, string>;
  pending: Record<string, boolean>;
  errors: Record<string, string | null>;
  expanded: Record<string, boolean>;
  sectionCollapsed: Record<string, boolean>;
  newFileScope: string | null;
  newFileName: string;
  newFileError: string | null;
  newFilePending: boolean;

  setDraft: (path: string, content: string) => void;
  clearDraft: (path: string) => void;
  setPending: (path: string, value: boolean) => void;
  setError: (path: string, value: string | null) => void;
  setExpanded: (path: string, value: boolean) => void;
  setSectionCollapsed: (key: string, value: boolean) => void;

  setNewFileScope: (scope: string | null) => void;
  setNewFileName: (name: string) => void;
  setNewFileError: (err: string | null) => void;
  setNewFilePending: (value: boolean) => void;
};

export const useMemoryStore = create<MemoryState>((set) => ({
  drafts: {},
  pending: {},
  errors: {},
  expanded: {},
  sectionCollapsed: {},
  newFileScope: null,
  newFileName: '',
  newFileError: null,
  newFilePending: false,

  setDraft: (path, content) =>
    set((s) => ({ drafts: { ...s.drafts, [path]: content } })),
  clearDraft: (path) =>
    set((s) => {
      const next = { ...s.drafts };
      delete next[path];
      return { drafts: next };
    }),
  setPending: (path, value) =>
    set((s) => ({ pending: { ...s.pending, [path]: value } })),
  setError: (path, value) =>
    set((s) => ({ errors: { ...s.errors, [path]: value } })),
  setExpanded: (path, value) =>
    set((s) => ({ expanded: { ...s.expanded, [path]: value } })),
  setSectionCollapsed: (key, value) =>
    set((s) => ({ sectionCollapsed: { ...s.sectionCollapsed, [key]: value } })),

  setNewFileScope: (scope) => set({ newFileScope: scope, newFileError: null }),
  setNewFileName: (name) => set({ newFileName: name }),
  setNewFileError: (err) => set({ newFileError: err }),
  setNewFilePending: (value) => set({ newFilePending: value }),
}));
