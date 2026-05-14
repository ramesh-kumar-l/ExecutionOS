import { create } from "zustand";
import type { ContextSnapshot, DecisionLog } from "@/types";
import * as contextCommands from "@/lib/commands/context";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface ContextState {
  snapshots: ContextSnapshot[];
  decisions: DecisionLog[];
  isLoadingSnapshots: boolean;
  isLoadingDecisions: boolean;

  loadSnapshots: () => Promise<void>;
  createSnapshot: (input: contextCommands.CreateSnapshotInput) => Promise<ContextSnapshot | null>;
  deleteSnapshot: (id: string) => Promise<void>;

  loadDecisions: () => Promise<void>;
  createDecision: (input: contextCommands.CreateDecisionInput) => Promise<DecisionLog | null>;
  deleteDecision: (id: string) => Promise<void>;
}

export const useContextStore = create<ContextState>((set, get) => ({
  snapshots: [],
  decisions: [],
  isLoadingSnapshots: false,
  isLoadingDecisions: false,

  loadSnapshots: async () => {
    set({ isLoadingSnapshots: true });
    try {
      const snapshots = await contextCommands.getContextSnapshots();
      set({ snapshots, isLoadingSnapshots: false });
    } catch (err) {
      set({ isLoadingSnapshots: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createSnapshot: async (input) => {
    try {
      const snapshot = await contextCommands.createContextSnapshot(input);
      set((s) => ({ snapshots: [snapshot, ...s.snapshots] }));
      useAppStore.getState().addNotification({ type: "success", message: "Context saved." });
      return snapshot;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  deleteSnapshot: async (id) => {
    set((s) => ({ snapshots: s.snapshots.filter((snap) => snap.id !== id) }));
    try {
      await contextCommands.deleteContextSnapshot(id);
    } catch (err) {
      await get().loadSnapshots();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  loadDecisions: async () => {
    set({ isLoadingDecisions: true });
    try {
      const decisions = await contextCommands.getDecisionLog();
      set({ decisions, isLoadingDecisions: false });
    } catch (err) {
      set({ isLoadingDecisions: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createDecision: async (input) => {
    try {
      const decision = await contextCommands.createDecision(input);
      set((s) => ({ decisions: [decision, ...s.decisions] }));
      useAppStore.getState().addNotification({ type: "success", message: "Decision logged." });
      return decision;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  deleteDecision: async (id) => {
    set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) }));
    try {
      await contextCommands.deleteDecision(id);
    } catch (err) {
      await get().loadDecisions();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },
}));
