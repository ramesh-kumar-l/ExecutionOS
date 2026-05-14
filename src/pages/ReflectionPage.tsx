import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { PenLine, ChevronDown, ChevronUp } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useReflectionStore } from "@/stores/reflectionStore";
import { DailyReflectionForm } from "@/components/reflection/DailyReflectionForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ReflectionEntry } from "@/types";

export function ReflectionPage() {
  const [showForm, setShowForm] = useState(false);
  const { entries, isLoading, loadEntries } = useReflectionStore();

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const todayEntry = entries.find((e) => e.date === format(new Date(), "yyyy-MM-dd"));

  return (
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
            <h1 className="text-2xl font-semibold text-foreground">Reflection</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          {!todayEntry && !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <PenLine size={14} />
              Reflect today
            </Button>
          )}
        </div>

        {/* Today form */}
        <AnimatePresence>
          {showForm && !todayEntry && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-8 rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-5">Daily Reflection</h2>
              <DailyReflectionForm onSuccess={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's entry (if already submitted) */}
        {todayEntry && (
          <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <p className="text-sm font-medium text-foreground">Today&apos;s reflection complete</p>
            </div>
            {(todayEntry.mood ?? todayEntry.energy) && (
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {todayEntry.mood && <span>Mood: {todayEntry.mood}/5</span>}
                {todayEntry.energy && <span>Energy: {todayEntry.energy}/5</span>}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!showForm && !todayEntry && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center mb-8">
            <PenLine size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reflection for today yet.</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Start daily reflection
            </Button>
          </div>
        )}

        {/* Past entries */}
        {entries.length > (todayEntry ? 1 : 0) && (
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Past Reflections
            </h2>
            <div className="space-y-1">
              {entries
                .filter((e) => e.id !== todayEntry?.id)
                .slice(0, 10)
                .map((entry) => (
                  <ReflectionRow key={entry.id} entry={entry} />
                ))}
            </div>
          </section>
        )}

        {isLoading && (
          <div className="space-y-2 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReflectionRow({ entry }: { entry: ReflectionEntry }) {
  const [open, setOpen] = useState(false);
  const content = entry.content as Record<string, string>;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {format(parseISO(entry.date), "EEEE, MMM d")}
          </span>
          {(entry.mood ?? entry.energy) && (
            <span className="text-xs text-muted-foreground">
              {entry.mood ? `Mood ${entry.mood}` : ""}
              {entry.mood && entry.energy ? " · " : ""}
              {entry.energy ? `Energy ${entry.energy}` : ""}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Separator />
            <div className="px-4 py-3 space-y-3">
              {Object.entries(content).map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground capitalize mb-0.5">
                      {k.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-foreground">{v}</p>
                  </div>
                ) : null
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
