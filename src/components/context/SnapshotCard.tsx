import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2, Clock, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useContextStore } from "@/stores/contextStore";
import { cn } from "@/lib/utils";
import type { ContextSnapshot } from "@/types";

interface Props {
  snapshot: ContextSnapshot;
}

export function SnapshotCard({ snapshot }: Props) {
  const [expanded, setExpanded] = useState(false);
  const deleteSnapshot = useContextStore((s) => s.deleteSnapshot);

  const threadCount = snapshot.open_threads.length;
  const actionCount = snapshot.next_actions.length;

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
          <p className="text-sm font-medium text-foreground truncate">{snapshot.title}</p>
          {snapshot.context_text && !expanded && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {snapshot.context_text}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {threadCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <MessageSquare size={10} />
                {threadCount} thread{threadCount !== 1 ? "s" : ""}
              </span>
            )}
            {actionCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <ArrowRight size={10} />
                {actionCount} action{actionCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono">
            <Clock size={9} />
            {format(parseISO(snapshot.created_at), "MMM d, HH:mm")}
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
              {snapshot.context_text && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Context
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {snapshot.context_text}
                  </p>
                </div>
              )}

              {snapshot.open_threads.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MessageSquare size={9} /> Open Threads
                  </p>
                  <ul className="space-y-1">
                    {snapshot.open_threads.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-muted-foreground/50 mt-0.5 shrink-0">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {snapshot.decisions.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Zap size={9} /> Decisions Made
                  </p>
                  <ul className="space-y-1">
                    {snapshot.decisions.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-muted-foreground/50 mt-0.5 shrink-0">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {snapshot.next_actions.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <ArrowRight size={9} /> Next Actions
                  </p>
                  <ul className="space-y-1">
                    {snapshot.next_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-muted-foreground/50 mt-0.5 shrink-0">→</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-border">
                <span className="text-[10px] text-muted-foreground/50">
                  {format(parseISO(snapshot.created_at), "MMMM d, yyyy 'at' HH:mm")}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteSnapshot(snapshot.id);
                  }}
                  className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors"
                  title="Delete snapshot"
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
