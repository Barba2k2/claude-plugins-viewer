import { create } from 'zustand';
import type { MemoryFile } from './memory';

type MemoryState = {
  drafts: Record<string, string>;
  pending: Record<string, boolean>;
  errors: Record<string, string | null>;
  expanded: Record<string, boolean>;
  sectionCollapsed: Record<string, boolean>;
  projectMemories: Record<string, MemoryFile[]>;
  projectMemoryPending: Record<string, boolean>;
  projectMemoryError: Record<string, string | null>;
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
  setProjectMemories: (projectId: string, files: MemoryFile[]) => void;
  setProjectMemoryPending: (projectId: string, value: boolean) => void;
  setProjectMemoryError: (projectId: string, value: string | null) => void;

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
  projectMemories: {},
  projectMemoryPending: {},
  projectMemoryError: {},
  newFileScope: null,
  newFileName: '',
  newFileError: null,
  newFilePending: false,

  setDraft: (path, content) => set((s) => ({ drafts: { ...s.drafts, [path]: content } })),
  clearDraft: (path) =>
    set((s) => {
      const next = { ...s.drafts };
      delete next[path];
      return { drafts: next };
    }),
  setPending: (path, value) => set((s) => ({ pending: { ...s.pending, [path]: value } })),
  setError: (path, value) => set((s) => ({ errors: { ...s.errors, [path]: value } })),
  setExpanded: (path, value) => set((s) => ({ expanded: { ...s.expanded, [path]: value } })),
  setSectionCollapsed: (key, value) =>
    set((s) => ({ sectionCollapsed: { ...s.sectionCollapsed, [key]: value } })),
  setProjectMemories: (projectId, files) =>
    set((s) => ({ projectMemories: { ...s.projectMemories, [projectId]: files } })),
  setProjectMemoryPending: (projectId, value) =>
    set((s) => ({ projectMemoryPending: { ...s.projectMemoryPending, [projectId]: value } })),
  setProjectMemoryError: (projectId, value) =>
    set((s) => ({ projectMemoryError: { ...s.projectMemoryError, [projectId]: value } })),

  setNewFileScope: (scope) => set({ newFileScope: scope, newFileError: null }),
  setNewFileName: (name) => set({ newFileName: name }),
  setNewFileError: (err) => set({ newFileError: err }),
  setNewFilePending: (value) => set({ newFilePending: value }),
}));
