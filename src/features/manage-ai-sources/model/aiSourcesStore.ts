import { create } from 'zustand';

type AiSourcesState = {
  drafts: Record<string, string>;
  pending: Record<string, boolean>;
  errors: Record<string, string | null>;
  expanded: Record<string, boolean>;

  newFileOpen: Record<string, boolean>;
  newFileName: Record<string, string>;
  newFileError: Record<string, string | null>;

  addName: string;
  addPath: string;
  addError: string | null;

  customEditing: Record<string, boolean>;
  customNameDraft: Record<string, string>;
  customConfirmRemove: Record<string, boolean>;
  customError: Record<string, string | null>;

  defaultEditing: Record<string, boolean>;
  defaultNameDraft: Record<string, string>;
  defaultError: Record<string, string | null>;

  setDraft: (path: string, content: string) => void;
  clearDraft: (path: string) => void;
  setPending: (path: string, value: boolean) => void;
  setError: (path: string, value: string | null) => void;
  setExpanded: (path: string, value: boolean) => void;

  setNewFileOpen: (sourceId: string, value: boolean) => void;
  setNewFileName: (sourceId: string, value: string) => void;
  setNewFileError: (sourceId: string, value: string | null) => void;
  resetNewFile: (sourceId: string) => void;

  setAddName: (value: string) => void;
  setAddPath: (value: string) => void;
  setAddError: (value: string | null) => void;
  resetAdd: () => void;

  setCustomEditing: (id: string, value: boolean) => void;
  setCustomNameDraft: (id: string, value: string) => void;
  setCustomConfirmRemove: (id: string, value: boolean) => void;
  setCustomError: (id: string, value: string | null) => void;

  setDefaultEditing: (id: string, value: boolean) => void;
  setDefaultNameDraft: (id: string, value: string) => void;
  setDefaultError: (id: string, value: string | null) => void;
};

export const useAiSourcesStore = create<AiSourcesState>((set) => ({
  drafts: {},
  pending: {},
  errors: {},
  expanded: {},

  newFileOpen: {},
  newFileName: {},
  newFileError: {},

  addName: '',
  addPath: '',
  addError: null,

  customEditing: {},
  customNameDraft: {},
  customConfirmRemove: {},
  customError: {},

  defaultEditing: {},
  defaultNameDraft: {},
  defaultError: {},

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

  setNewFileOpen: (sourceId, value) =>
    set((s) => ({ newFileOpen: { ...s.newFileOpen, [sourceId]: value } })),
  setNewFileName: (sourceId, value) =>
    set((s) => ({ newFileName: { ...s.newFileName, [sourceId]: value } })),
  setNewFileError: (sourceId, value) =>
    set((s) => ({ newFileError: { ...s.newFileError, [sourceId]: value } })),
  resetNewFile: (sourceId) =>
    set((s) => {
      const open = { ...s.newFileOpen };
      const name = { ...s.newFileName };
      const error = { ...s.newFileError };
      delete open[sourceId];
      delete name[sourceId];
      delete error[sourceId];
      return { newFileOpen: open, newFileName: name, newFileError: error };
    }),

  setAddName: (value) => set({ addName: value }),
  setAddPath: (value) => set({ addPath: value }),
  setAddError: (value) => set({ addError: value }),
  resetAdd: () => set({ addName: '', addPath: '', addError: null }),

  setCustomEditing: (id, value) =>
    set((s) => ({ customEditing: { ...s.customEditing, [id]: value } })),
  setCustomNameDraft: (id, value) =>
    set((s) => ({ customNameDraft: { ...s.customNameDraft, [id]: value } })),
  setCustomConfirmRemove: (id, value) =>
    set((s) => ({ customConfirmRemove: { ...s.customConfirmRemove, [id]: value } })),
  setCustomError: (id, value) =>
    set((s) => ({ customError: { ...s.customError, [id]: value } })),

  setDefaultEditing: (id, value) =>
    set((s) => ({ defaultEditing: { ...s.defaultEditing, [id]: value } })),
  setDefaultNameDraft: (id, value) =>
    set((s) => ({ defaultNameDraft: { ...s.defaultNameDraft, [id]: value } })),
  setDefaultError: (id, value) =>
    set((s) => ({ defaultError: { ...s.defaultError, [id]: value } })),
}));
