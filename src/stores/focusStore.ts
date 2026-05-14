import { create } from "zustand";
import type { FocusSession } from "@/types";
import * as executionCommands from "@/lib/commands/execution";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface FocusState {
  activeSession: FocusSession | null;
  elapsedSeconds: number;
  isLoading: boolean;

  loadActiveSession: () => Promise<void>;
  startSession: (durationMinutes: number, blockId?: string, goalId?: string) => Promise<void>;
  endSession: (notes?: string) => Promise<void>;
}

export const useFocusStore = create<FocusState>((set, get) => {
  let _interval: ReturnType<typeof setInterval> | null = null;

  const startTicking = () => {
    if (_interval) clearInterval(_interval);
    _interval = setInterval(() => {
      set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
    }, 1000);
  };

  const stopTicking = () => {
    if (_interval) {
      clearInterval(_interval);
      _interval = null;
    }
  };

  return {
    activeSession: null,
    elapsedSeconds: 0,
    isLoading: false,

    loadActiveSession: async () => {
      set({ isLoading: true });
      try {
        const session = await executionCommands.getActiveFocusSession();
        if (session) {
          const elapsed = Math.floor(
            (Date.now() - new Date(session.started_at).getTime()) / 1000
          );
          set({ activeSession: session, elapsedSeconds: Math.max(0, elapsed), isLoading: false });
          startTicking();
        } else {
          set({ activeSession: null, elapsedSeconds: 0, isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    startSession: async (durationMinutes, blockId, goalId) => {
      try {
        const session = await executionCommands.startFocusSession(
          durationMinutes,
          blockId,
          goalId
        );
        set({ activeSession: session, elapsedSeconds: 0 });
        startTicking();
      } catch (err) {
        useAppStore.getState().addNotification({
          type: "error",
          message: parseInvokeError(err),
        });
      }
    },

    endSession: async (notes) => {
      const { activeSession } = get();
      if (!activeSession) return;
      stopTicking();
      try {
        await executionCommands.endFocusSession(activeSession.id, notes);
        set({ activeSession: null, elapsedSeconds: 0 });
        useAppStore.getState().addNotification({
          type: "success",
          message: "Focus session ended",
        });
      } catch (err) {
        useAppStore.getState().addNotification({
          type: "error",
          message: parseInvokeError(err),
        });
      }
    },
  };
});
