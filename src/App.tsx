import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Toaster } from "@/components/ui/toaster";
import { TodayPage } from "@/pages/TodayPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { DomainsPage } from "@/pages/DomainsPage";
import { ReflectionPage } from "@/pages/ReflectionPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { KnowledgePage } from "@/pages/KnowledgePage";
import { ContextPage } from "@/pages/ContextPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { WeeklyPage } from "@/pages/WeeklyPage";
import { useAppStore } from "@/stores/appStore";
import { useDomainsStore } from "@/stores/domainsStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { useSettingsStore } from "@/stores/settingsStore";

export default function App() {
  const { activeRoute, isInitialized, setInitialized } = useAppStore();
  const loadDomains = useDomainsStore((s) => s.loadDomains);
  const loadGoals = useGoalsStore((s) => s.loadGoals);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadDomains(), loadGoals(), loadSettings()]);
      setInitialized();
    };
    void init();
  }, [loadDomains, loadGoals, loadSettings, setInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <PageLayout>
        <AnimatePresence mode="wait">
          {activeRoute === "today" && <TodayPage key="today" />}
          {activeRoute === "weekly" && <WeeklyPage key="weekly" />}
          {activeRoute === "goals" && <GoalsPage key="goals" />}
          {activeRoute === "domains" && <DomainsPage key="domains" />}
          {activeRoute === "reflection" && <ReflectionPage key="reflection" />}
          {activeRoute === "knowledge" && <KnowledgePage key="knowledge" />}
          {activeRoute === "context" && <ContextPage key="context" />}
          {activeRoute === "execution" && <SchedulePage key="execution" />}
          {activeRoute === "settings" && <SettingsPage key="settings" />}
        </AnimatePresence>
      </PageLayout>
      <CommandPalette />
      <Toaster />
    </>
  );
}
