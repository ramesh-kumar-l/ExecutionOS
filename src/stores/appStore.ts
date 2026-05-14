import { create } from "zustand";
import type { AppNotification, AppRoute } from "@/types";
import { generateId, nowIso } from "@/lib/utils";

interface AppState {
  activeRoute: AppRoute;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notifications: AppNotification[];
  isInitialized: boolean;

  setRoute: (route: AppRoute) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
  setInitialized: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeRoute: "today",
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notifications: [],
  isInitialized: false,

  setRoute: (route) => set({ activeRoute: route }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { ...n, id: generateId(), timestamp: nowIso() },
      ].slice(-5),
    })),

  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  setInitialized: () => set({ isInitialized: true }),
}));
