import { create } from "zustand";
import type { Domain } from "@/types";
import * as domainCommands from "@/lib/commands/domains";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface DomainsState {
  domains: Domain[];
  activeDomainId: string | null;
  isLoading: boolean;

  loadDomains: () => Promise<void>;
  updateDomain: (id: string, patch: Partial<Pick<Domain, "vision" | "purpose" | "current_status">>) => Promise<void>;
  setActiveDomain: (id: string | null) => void;
}

export const useDomainsStore = create<DomainsState>((set) => ({
  domains: [],
  activeDomainId: null,
  isLoading: false,

  loadDomains: async () => {
    set({ isLoading: true });
    try {
      const domains = await domainCommands.getDomains();
      set({ domains, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({
        type: "error",
        message: parseInvokeError(err),
      });
    }
  },

  updateDomain: async (id, patch) => {
    // Optimistic update
    set((s) => ({
      domains: s.domains.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
    try {
      const updated = await domainCommands.updateDomain(id, patch);
      set((s) => ({
        domains: s.domains.map((d) => (d.id === id ? updated : d)),
      }));
    } catch (err) {
      // Revert on failure — reload from source of truth
      const domains = await domainCommands.getDomains();
      set({ domains });
      useAppStore.getState().addNotification({
        type: "error",
        message: parseInvokeError(err),
      });
    }
  },

  setActiveDomain: (id) => set({ activeDomainId: id }),
}));
