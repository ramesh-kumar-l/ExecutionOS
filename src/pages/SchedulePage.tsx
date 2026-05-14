import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RepeatIcon, Plus, Trash2 } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useRecurringStore } from "@/stores/recurringStore";
import { CreateRuleModal } from "@/components/execution/CreateRuleModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecurringRule } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BLOCK_COLORS: Record<string, string> = {
  deep_work: "bg-accent/15 text-accent",
  shallow: "bg-secondary text-foreground",
  meeting: "bg-purple-500/12 text-purple-400",
  ritual: "bg-green-500/12 text-green-400",
  rest: "bg-muted text-muted-foreground",
  buffer: "bg-muted/40 text-muted-foreground",
};

const BLOCK_LABELS: Record<string, string> = {
  deep_work: "Deep Work",
  shallow: "Shallow",
  meeting: "Meeting",
  ritual: "Ritual",
  rest: "Rest",
  buffer: "Buffer",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatPattern(rule: RecurringRule): string {
  if (rule.pattern === "daily") return "Every day";
  if (rule.pattern === "monthly") return "Every month";
  if (rule.days_of_week.length === 7) return "Every day";
  if (rule.days_of_week.length === 0) return "Weekly";
  return rule.days_of_week.map((d) => DAYS[d] ?? "").join(", ");
}

interface RuleCardProps {
  rule: RecurringRule;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 flex items-start gap-4 transition-opacity",
        !rule.is_active && "opacity-50"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-sm font-medium text-foreground">{rule.title}</p>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              BLOCK_COLORS[rule.block_type] ?? "bg-muted text-muted-foreground"
            )}
          >
            {BLOCK_LABELS[rule.block_type] ?? rule.block_type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatPattern(rule)} · {rule.start_time} · {formatDuration(rule.duration_minutes)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(rule.id, !rule.is_active)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            rule.is_active ? "bg-accent" : "bg-muted"
          )}
          title={rule.is_active ? "Disable rule" : "Enable rule"}
        >
          <span
            className={cn(
              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
              rule.is_active ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>

        <button
          onClick={() => onDelete(rule.id)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete rule"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function SchedulePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { rules, isLoading, loadRules, toggleRule, deleteRule } = useRecurringStore();

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  return (
    <>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full overflow-y-auto selectable"
      >
        <div className="max-w-2xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Schedule Templates</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Recurring time blocks added to your day automatically
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              New rule
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <RepeatIcon size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recurring rules yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create a rule to automatically populate your daily schedule.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> New rule
              </Button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {rules.map((rule) => (
                <motion.div key={rule.id} variants={slideUp}>
                  <RuleCard
                    rule={rule}
                    onToggle={toggleRule}
                    onDelete={deleteRule}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <CreateRuleModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
