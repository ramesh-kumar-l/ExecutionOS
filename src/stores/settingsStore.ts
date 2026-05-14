import { create } from "zustand";
import type { UserSettings } from "@/types";
import * as settingsCommands from "@/lib/commands/settings";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await settingsCommands.getSettings();
      set({ settings, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  updateSettings: async (patch) => {
    const prev = get().settings;
    if (prev) set({ settings: { ...prev, ...patch } });
    try {
      const updated = await settingsCommands.updateSettings(patch);
      set({ settings: updated });
      useAppStore.getState().addNotification({ type: "success", message: "Settings saved." });
    } catch (err) {
      if (prev) set({ settings: prev });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },
}));
