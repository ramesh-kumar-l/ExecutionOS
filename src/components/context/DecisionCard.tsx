import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2, Calendar, List } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useContextStore } from "@/stores/contextStore";
import { cn } from "@/lib/utils";
import type { DecisionLog } from "@/types";

interface Props {
  decision: DecisionLog;
}

export function DecisionCard({ decision }: Props) {
  const [expanded, setExpanded] = useState(false);
  const deleteDecision = useContextStore((s) => s.deleteDecision);

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border bg-card transition-colors",
        expanded ? "border-accent/25" : "border-border"
      )}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/20 transition-colors rounded-lg"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{decision.title}</p>
          {decision.rationale && !expanded && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {decision.rationale}
            </p>
          )}
          {decision.review_date && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/70">
              <Calendar size={9} />
              Review: {format(parseISO(decision.review_date), "MMM d, yyyy")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {format(parseISO(decision.decided_at), "MMM d")}
          </span>
          {expanded ? (
            <ChevronUp size={13} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={13} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="px-4 py-4 space-y-4">
              {decision.context && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Context
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {decision.context}
                  </p>
                </div>
              )}

              {decision.options.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <List size={9} /> Options Considered
                  </p>
                  <ul className="space-y-1">
                    {decision.options.map((opt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-muted-foreground/50 mt-0.5 shrink-0">–</span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {decision.rationale && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Rationale
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {decision.rationale}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-border">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground/50">
                    Decided {format(parseISO(decision.decided_at), "MMMM d, yyyy")}
                  </p>
                  {decision.review_date && (
                    <p className="text-[10px] text-muted-foreground/50">
                      Review on {format(parseISO(decision.review_date), "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteDecision(decision.id);
                  }}
                  className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors"
                  title="Delete decision"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
