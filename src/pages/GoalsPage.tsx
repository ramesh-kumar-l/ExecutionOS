import { motion } from "framer-motion";
import { Target, Plus, Filter } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useGoalsStore } from "@/stores/goalsStore";
import { useDomainsStore } from "@/stores/domainsStore";
import { PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10",
  high: "text-orange-400 bg-orange-400/10",
  medium: "text-blue-400 bg-blue-400/10",
  low: "text-muted-foreground bg-muted",
};

export function GoalsPage() {
  const goals = useGoalsStore((s) => s.goals);
  const domains = useDomainsStore((s) => s.domains);
  const isLoading = useGoalsStore((s) => s.isLoading);

  const getDomainName = (domainId: string) =>
    domains.find((d) => d.id === domainId)?.name ?? "—";

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Goals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeGoals.length} active · {completedGoals.length} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Filter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
              <Plus size={14} />
              New goal
            </button>
          </div>
        </div>

        {/* Goals list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Target size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active goals.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create your first strategic goal to get started.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {activeGoals.map((goal) => (
              <motion.div
                key={goal.id}
                variants={slideUp}
                className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors cursor-default"
              >
                {/* Progress ring */}
                <div className="relative w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="2.5"
                      strokeDasharray={`${(goal.progress / 100) * 94.2} 94.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-foreground">
                    {goal.progress}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{getDomainName(goal.domain_id)}</p>
                </div>

                {/* Priority badge */}
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    PRIORITY_COLORS[goal.priority] ?? "text-muted-foreground bg-muted"
                  )}
                >
                  {PRIORITY_LABELS[goal.priority] ?? goal.priority}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
