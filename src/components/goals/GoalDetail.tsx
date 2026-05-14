import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { useGoalsStore } from "@/stores/goalsStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types";

const PRIORITY_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "secondary",
};

interface GoalDetailProps {
  goal: Goal;
  domainName: string;
}

export function GoalRow({ goal, domainName }: GoalDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const { milestones, loadMilestones, addMilestone, completeMilestone, deleteMilestone, updateGoal, deleteGoal } =
    useGoalsStore();
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const goalMilestones = milestones[goal.id] ?? [];

  useEffect(() => {
    if (expanded && !milestones[goal.id]) {
      void loadMilestones(goal.id);
    }
  }, [expanded, goal.id, milestones, loadMilestones]);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const handleAddMilestone = () => {
    const title = newTitle.trim();
    if (!title) return;
    void addMilestone(goal.id, title);
    setNewTitle("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddMilestone();
  };

  const completedCount = goalMilestones.filter((m) => m.completed_at).length;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border bg-card transition-colors",
        expanded ? "border-accent/25" : "border-border"
      )}
    >
      {/* Goal row header */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer hover:bg-muted/20 transition-colors rounded-lg"
        onClick={() => setExpanded((v) => !v)}
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
          <p className={cn("text-sm font-medium text-foreground truncate", goal.status === "completed" && "line-through text-muted-foreground")}>
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{domainName}</span>
            {goal.target_date && (
              <span className="text-xs text-muted-foreground/60">· {goal.target_date}</span>
            )}
            {goalMilestones.length > 0 && (
              <span className="text-xs text-muted-foreground/60">
                · {completedCount}/{goalMilestones.length} milestones
              </span>
            )}
          </div>
          {goal.progress > 0 && (
            <Progress value={goal.progress} className="mt-2 h-1" />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={PRIORITY_VARIANT[goal.priority] ?? "secondary"}>
            {PRIORITY_LABELS[goal.priority] ?? goal.priority}
          </Badge>
          {expanded ? (
            <ChevronUp size={14} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-4 space-y-4">
              {/* Description + Success criteria */}
              {(goal.description || goal.success_criteria) && (
                <div className="space-y-3">
                  {goal.description && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                      <p className="text-xs text-foreground leading-relaxed">{goal.description}</p>
                    </div>
                  )}
                  {goal.success_criteria && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Success criteria</p>
                      <p className="text-xs text-foreground leading-relaxed">{goal.success_criteria}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Milestones */}
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Milestones</p>

                {goalMilestones.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {goalMilestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => {
                            if (!m.completed_at) void completeMilestone(m.id, goal.id);
                          }}
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                            m.completed_at
                              ? "bg-accent border-accent"
                              : "border-border hover:border-accent/50"
                          )}
                        >
                          {m.completed_at && <Check size={9} className="text-accent-foreground" />}
                        </button>
                        <span className={cn(
                          "flex-1 text-xs",
                          m.completed_at ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {m.title}
                        </span>
                        <button
                          onClick={() => void deleteMilestone(m.id, goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone input */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-dashed border-border shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Add milestone…"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/40 text-foreground"
                  />
                  {newTitle.trim() && (
                    <button
                      onClick={handleAddMilestone}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                {goal.status === "active" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => void updateGoal({ id: goal.id, status: "completed" })}
                  >
                    <Check size={12} />
                    Mark complete
                  </Button>
                )}
                {goal.status === "completed" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => void updateGoal({ id: goal.id, status: "active" })}
                  >
                    Reopen
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-muted-foreground ml-auto"
                  onClick={() => void updateGoal({ id: goal.id, status: "paused" })}
                >
                  Pause
                </Button>
                <button
                  onClick={() => void deleteGoal(goal.id)}
                  className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors"
                  title="Delete goal"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
