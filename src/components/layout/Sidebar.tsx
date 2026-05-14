import {
  CalendarDays,
  CalendarRange,
  Target,
  LayoutGrid,
  BookOpen,
  PenLine,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  Repeat2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import type { AppRoute } from "@/types";
import { cn } from "@/lib/utils";

interface NavItem {
  route: AppRoute;
  label: string;
  icon: React.ElementType;
  shortcut: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: "today", label: "Today", icon: CalendarDays, shortcut: "1" },
  { route: "weekly", label: "Week", icon: CalendarRange, shortcut: "2" },
  { route: "goals", label: "Goals", icon: Target, shortcut: "3" },
  { route: "domains", label: "Domains", icon: LayoutGrid, shortcut: "4" },
  { route: "reflection", label: "Reflection", icon: PenLine, shortcut: "5" },
  { route: "knowledge", label: "Knowledge", icon: BookOpen, shortcut: "6" },
  { route: "context", label: "Context", icon: Cpu, shortcut: "7" },
  { route: "execution", label: "Schedule", icon: Repeat2, shortcut: "8" },
];

export function Sidebar() {
  const { activeRoute, setRoute, sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } =
    useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-col border-r border-border bg-card overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex h-12 items-center px-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Layers size={14} />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={false}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold tracking-tight text-foreground truncate"
            >
              LENSSTACK
            </motion.span>
          )}
        </div>
      </div>

      {/* Command palette trigger */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] font-mono bg-background px-1 rounded border border-border">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ route, label, icon: Icon, shortcut }) => (
          <button
            key={route}
            onClick={() => setRoute(route)}
            title={sidebarCollapsed ? `${label} (⌘${shortcut})` : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
              activeRoute === route
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-border pt-2">
        <button
          onClick={() => setRoute("settings")}
          title={sidebarCollapsed ? "Settings" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
            activeRoute === "settings"
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Settings size={16} className="shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={16} className="shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
