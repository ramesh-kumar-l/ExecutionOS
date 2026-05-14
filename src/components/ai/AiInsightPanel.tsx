import { motion } from "framer-motion";
import { Brain, Lightbulb } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useAiStore } from "@/stores/aiStore";
import { cn } from "@/lib/utils";

const CONFIDENCE_BADGE: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  low: "bg-muted text-muted-foreground",
};

export function AiInsightPanel() {
  const { insights, isLoadingInsights } = useAiStore();

  if (isLoadingInsights) {
    return (
      <section className="mt-8">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Brain size={11} />
          AI Analysis
        </h2>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (insights.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Brain size={11} />
        AI Analysis
      </h2>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            variants={slideUp}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <Lightbulb size={13} className="text-accent shrink-0 mt-px" />
                <p className="text-sm font-medium text-foreground">{insight.insight}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize shrink-0",
                  CONFIDENCE_BADGE[insight.confidence] ?? CONFIDENCE_BADGE["low"]
                )}
              >
                {insight.confidence}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1.5 ml-[21px]">
              {insight.reasoning}
            </p>
            <p className="text-xs text-accent ml-[21px]">→ {insight.suggestion}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
