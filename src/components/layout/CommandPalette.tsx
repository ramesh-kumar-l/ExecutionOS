import { useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Target,
  LayoutGrid,
  PenLine,
  BookOpen,
  Settings,
  Search,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useGoalsStore } from "@/stores/goalsStore";
import type { AppRoute } from "@/types";
import { scaleIn } from "@/lib/animations";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setRoute } = useAppStore();
  const goals = useGoalsStore((s) => s.goals);
  const setActiveGoal = useGoalsStore((s) => s.setActiveGoal);

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen, close]);

  const navigate = (route: AppRoute) => {
    setRoute(route);
    close();
  };

  const navItems: CommandItem[] = [
    { id: "today", label: "Today", icon: CalendarDays, action: () => navigate("today"), group: "Navigate" },
    { id: "goals", label: "Goals", icon: Target, action: () => navigate("goals"), group: "Navigate" },
    { id: "domains", label: "Domains", icon: LayoutGrid, action: () => navigate("domains"), group: "Navigate" },
    { id: "reflection", label: "Reflection", icon: PenLine, action: () => navigate("reflection"), group: "Navigate" },
    { id: "knowledge", label: "Knowledge", icon: BookOpen, action: () => navigate("knowledge"), group: "Navigate" },
    { id: "settings", label: "Settings", icon: Settings, action: () => navigate("settings"), group: "Navigate" },
  ];

  const goalItems: CommandItem[] = goals.slice(0, 5).map((g) => ({
    id: `goal-${g.id}`,
    label: g.title,
    icon: Target,
    action: () => {
      setActiveGoal(g.id);
      navigate("goals");
    },
    group: "Goals",
  }));

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed left-1/2 top-[20%] z-50 w-[560px] -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              <div className="flex items-center border-b border-border px-3">
                <Search size={16} className="text-muted-foreground shrink-0" />
                <Command.Input
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent py-3 px-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
                <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto py-2">
                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigate">
                  {navItems.map((item) => (
                    <CommandItem key={item.id} item={item} />
                  ))}
                </Command.Group>

                {goalItems.length > 0 && (
                  <Command.Group heading="Goals">
                    {goalItems.map((item) => (
                      <CommandItem key={item.id} item={item} />
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ item }: { item: { id: string; label: string; icon: React.ElementType; action: () => void } }) {
  const Icon = item.icon;
  return (
    <Command.Item
      value={item.id}
      onSelect={item.action}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground cursor-default aria-selected:bg-accent/10 aria-selected:text-accent"
    >
      <Icon size={15} className="shrink-0 text-muted-foreground" />
      <span>{item.label}</span>
    </Command.Item>
  );
}
