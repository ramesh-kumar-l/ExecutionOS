import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, Plus, Zap } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useGoalsStore } from "@/stores/goalsStore";

export function TodayPage() {
  const goals = useGoalsStore((s) => s.goals.filter((g) => g.status === "active").slice(0, 3));
  const today = new Date();

  return (
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
            <span>{format(today, "EEEE")}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {format(today, "MMMM d, yyyy")}
          </h1>
        </div>

        {/* Active Goals Quick View */}
        {goals.length > 0 && (
          <motion.section
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Goals
              </h2>
            </div>
            <div className="space-y-2">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  variants={slideUp}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-border/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{goal.priority} priority</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                      {goal.progress}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Today's Focus */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Today&apos;s Time Blocks
            </h2>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={13} />
              Add block
            </button>
          </div>

          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Zap size={24} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No time blocks scheduled.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add blocks to structure your day with intention.
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
