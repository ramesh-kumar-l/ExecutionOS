import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Square } from "lucide-react";
import { useFocusStore } from "@/stores/focusStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DURATIONS = [25, 50, 90] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60).toString().padStart(2, "0");
  const s = (Math.abs(seconds) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface FocusTimerProps {
  blockId?: string;
  goalId?: string;
}

export function FocusTimer({ blockId, goalId }: FocusTimerProps) {
  const { activeSession, elapsedSeconds, startSession, endSession } = useFocusStore();
  const [endNotes, setEndNotes] = useState("");
  const [showEndForm, setShowEndForm] = useState(false);

  if (activeSession) {
    const plannedSecs = activeSession.planned_duration_minutes * 60;
    const remaining = plannedSecs - elapsedSeconds;
    const overrun = remaining < 0;
    const progress = Math.min(100, (elapsedSeconds / plannedSecs) * 100);

    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-foreground">Focus session active</span>
          </div>
          <button
            onClick={() => setShowEndForm((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showEndForm ? "cancel" : "end session"}
          </button>
        </div>

        <div className="text-center mb-3">
          <span
            className={cn(
              "text-3xl font-mono font-semibold tabular-nums",
              overrun ? "text-destructive" : "text-foreground"
            )}
          >
            {overrun ? `+${formatTime(-remaining)}` : formatTime(remaining)}
          </span>
          {overrun && (
            <p className="text-[10px] text-destructive/60 mt-0.5">
              Over planned time
            </p>
          )}
        </div>

        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              overrun ? "bg-destructive" : "bg-accent"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence>
          {showEndForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <textarea
                placeholder="Session notes (optional)…"
                value={endNotes}
                onChange={(e) => setEndNotes(e.target.value)}
                className="w-full mt-3 text-xs rounded-md border border-border bg-background px-3 py-2 resize-none min-h-[52px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40"
              />
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  void endSession(endNotes || undefined);
                  setShowEndForm(false);
                  setEndNotes("");
                }}
              >
                <Square size={11} />
                End &amp; save
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Timer size={13} className="text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Start focus session</span>
      </div>
      <div className="flex gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => void startSession(d, blockId, goalId)}
            className="flex-1 py-2 rounded-md border border-border text-xs text-muted-foreground hover:border-accent/50 hover:text-foreground hover:bg-accent/5 transition-colors"
          >
            {d}m
          </button>
        ))}
      </div>
    </div>
  );
}
