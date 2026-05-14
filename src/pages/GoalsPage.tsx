import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Filter } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useGoalsStore } from "@/stores/goalsStore";
import { useDomainsStore } from "@/stores/domainsStore";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "secondary",
};

export function GoalsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"active" | "all">("active");

  const goals = useGoalsStore((s) => s.goals);
  const isLoading = useGoalsStore((s) => s.isLoading);
  const domains = useDomainsStore((s) => s.domains);

  const getDomainName = (id: string) => domains.find((d) => d.id === id)?.name ?? "—";

  const displayed = filterStatus === "active"
    ? goals.filter((g) => g.status === "active")
    : goals;

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Goals</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeCount} active · {completedCount} completed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus((s) => (s === "active" ? "all" : "active"))}
              >
                <Filter size={14} />
                {filterStatus === "active" ? "Active" : "All"}
              </Button>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} />
                New goal
              </Button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <Target size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No active goals.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create your first strategic goal to get started.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={14} /> New goal
              </Button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {displayed.map((goal) => (
                <motion.div
                  key={goal.id}
                  variants={slideUp}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-accent/25 transition-colors cursor-default"
                >
                  {/* Progress ring */}
                  <div className="relative w-10 h-10 shrink-0">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="hsl(var(--accent))" strokeWidth="2.5"
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{getDomainName(goal.domain_id)}</span>
                      {goal.target_date && (
                        <span className="text-xs text-muted-foreground/60">· {goal.target_date}</span>
                      )}
                    </div>
                    {goal.progress > 0 && (
                      <Progress value={goal.progress} className="mt-2 h-1" />
                    )}
                  </div>

                  {/* Priority */}
                  <Badge variant={PRIORITY_VARIANT[goal.priority] ?? "secondary"}>
                    {PRIORITY_LABELS[goal.priority] ?? goal.priority}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <CreateGoalModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
