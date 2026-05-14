import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useGoalsStore } from "@/stores/goalsStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useFocusStore } from "@/stores/focusStore";
import { DailyGrid } from "@/components/execution/DailyGrid";
import { CreateBlockModal } from "@/components/execution/CreateBlockModal";
import { FocusTimer } from "@/components/execution/FocusTimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { todayIso } from "@/lib/utils";

export function TodayPage() {
  const [blockOpen, setBlockOpen] = useState(false);
  const [defaultStart, setDefaultStart] = useState<string | undefined>();
  const today = todayIso();

  const topGoals = useGoalsStore((s) =>
    s.goals.filter((g) => g.status === "active").slice(0, 3)
  );
  const loadBlocks = useExecutionStore((s) => s.loadBlocks);
  const loadActiveSession = useFocusStore((s) => s.loadActiveSession);

  useEffect(() => {
    void loadBlocks(today);
    void loadActiveSession();
  }, [today, loadBlocks, loadActiveSession]);

  const openCreate = (startTime?: string) => {
    setDefaultStart(startTime);
    setBlockOpen(true);
  };

  return (
    <>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full overflow-y-auto selectable"
      >
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CalendarDays size={13} />
              <span>{format(new Date(), "EEEE")}</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {format(new Date(), "MMMM d, yyyy")}
            </h1>
          </div>

          {/* Focus timer */}
          <div className="mb-6">
            <FocusTimer />
          </div>

          {/* Active goals strip */}
          {topGoals.length > 0 && (
            <motion.section
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="mb-8"
            >
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Active Goals
              </h2>
              <div className="space-y-2">
                {topGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    variants={slideUp}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{goal.title}</p>
                      <Progress value={goal.progress} className="mt-1.5" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {goal.progress}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Daily grid */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Today&apos;s Schedule
              </h2>
              <Button variant="ghost" size="sm" onClick={() => openCreate()}>
                <Plus size={13} />
                Add block
              </Button>
            </div>
            <DailyGrid date={today} onCreateBlock={openCreate} />
          </section>
        </div>
      </motion.div>

      <CreateBlockModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        defaultStartTime={defaultStart}
        date={today}
      />
    </>
  );
}
