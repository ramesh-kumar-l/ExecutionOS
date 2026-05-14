import { create } from "zustand";
import type { KnowledgeNote, NoteType } from "@/types";
import * as knowledgeCommands from "@/lib/commands/knowledge";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface KnowledgeState {
  notes: KnowledgeNote[];
  isLoading: boolean;
  search: string;
  filterType: NoteType | "all";

  loadNotes: (params?: { search?: string; note_type?: NoteType }) => Promise<void>;
  createNote: (input: knowledgeCommands.CreateNoteInput) => Promise<KnowledgeNote | null>;
  updateNote: (id: string, patch: { title?: string; content?: string; tags?: string[]; source?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSearch: (q: string) => void;
  setFilterType: (t: NoteType | "all") => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  notes: [],
  isLoading: false,
  search: "",
  filterType: "all",

  loadNotes: async (params) => {
    set({ isLoading: true });
    try {
      const notes = await knowledgeCommands.getKnowledgeNotes(params);
      set({ notes, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createNote: async (input) => {
    try {
      const note = await knowledgeCommands.createKnowledgeNote(input);
      set((s) => ({ notes: [note, ...s.notes] }));
      useAppStore.getState().addNotification({ type: "success", message: "Note saved." });
      return note;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  updateNote: async (id, patch) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
    try {
      const updated = await knowledgeCommands.updateKnowledgeNote(id, patch);
      set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }));
    } catch (err) {
      await get().loadNotes();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  deleteNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    try {
      await knowledgeCommands.deleteKnowledgeNote(id);
    } catch (err) {
      await get().loadNotes();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  setSearch: (q) => set({ search: q }),
  setFilterType: (t) => set({ filterType: t }),
}));
