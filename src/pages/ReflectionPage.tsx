import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, subDays } from "date-fns";
import { PenLine, ChevronDown, ChevronUp, CalendarDays, BarChart2 } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useReflectionStore } from "@/stores/reflectionStore";
import { DailyReflectionForm } from "@/components/reflection/DailyReflectionForm";
import { WeeklyReviewForm } from "@/components/reflection/WeeklyReviewForm";
import { MonthlyReviewForm } from "@/components/reflection/MonthlyReviewForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ReflectionEntry, ReflectionType } from "@/types";

type Tab = "daily" | "weekly" | "monthly";

const TAB_LABELS: Record<Tab, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const TAB_ICONS: Record<Tab, React.ElementType> = {
  daily: PenLine,
  weekly: CalendarDays,
  monthly: BarChart2,
};

function isWithinDays(dateStr: string, days: number): boolean {
  const date = parseISO(dateStr);
  const cutoff = subDays(new Date(), days);
  return date >= cutoff;
}

export function ReflectionPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [showForm, setShowForm] = useState(false);
  const { entries, isLoading, loadEntries } = useReflectionStore();

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const todayEntry = entries.find(
    (e) => e.type === "daily" && e.date === format(new Date(), "yyyy-MM-dd")
  );
  const latestWeekly = entries.find(
    (e) => e.type === "weekly" && isWithinDays(e.date, 7)
  );
  const latestMonthly = entries.find(
    (e) => e.type === "monthly" && isWithinDays(e.date, 31)
  );

  const tabEntries = entries.filter((e) => e.type === (tab as ReflectionType));
  const hasRecentEntry =
    tab === "daily" ? !!todayEntry : tab === "weekly" ? !!latestWeekly : !!latestMonthly;

  const getEntryLabel = () => {
    if (tab === "daily") return "today's reflection";
    if (tab === "weekly") return "this week's review";
    return "this month's review";
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full overflow-y-auto selectable"
    >
      <div className="max-w-2xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reflection</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          {!hasRecentEntry && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <PenLine size={14} />
              {tab === "daily" ? "Reflect today" : tab === "weekly" ? "Start review" : "Start review"}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted/40 w-fit">
          {(["daily", "weekly", "monthly"] as Tab[]).map((t) => {
            const Icon = TAB_ICONS[t];
            return (
              <button
                key={t}
                onClick={() => { setTab(t); setShowForm(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={12} />
                {TAB_LABELS[t]}
              </button>
            );
          })}
        </div>

        {/* Recent entry done banner */}
        {hasRecentEntry && !showForm && (
          <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <p className="text-sm font-medium text-foreground capitalize">
                  {getEntryLabel()} complete
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowForm(true)}
              >
                Add another
              </Button>
            </div>
            {tab === "daily" && todayEntry && (todayEntry.mood ?? todayEntry.energy) && (
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {todayEntry.mood && <span>Mood: {todayEntry.mood}/5</span>}
                {todayEntry.energy && <span>Energy: {todayEntry.energy}/5</span>}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!showForm && !hasRecentEntry && tabEntries.length === 0 && !isLoading && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center mb-6">
            <PenLine size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "daily"
                ? "No reflection for today yet."
                : tab === "weekly"
                ? "No weekly review this week."
                : "No monthly review this month."}
            </p>
            <Button className="mt-4" size="sm" onClick={() => setShowForm(true)}>
              {tab === "daily" ? "Start daily reflection" : "Start review"}
            </Button>
          </div>
        )}

        {/* Active form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-8 rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-5">
                {tab === "daily"
                  ? "Daily Reflection"
                  : tab === "weekly"
                  ? "Weekly Review"
                  : "Monthly Review"}
              </h2>

              {tab === "daily" && (
                <DailyReflectionForm onSuccess={() => setShowForm(false)} />
              )}
              {tab === "weekly" && (
                <WeeklyReviewForm
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              )}
              {tab === "monthly" && (
                <MonthlyReviewForm
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past entries */}
        {tabEntries.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Past {TAB_LABELS[tab]} Reflections
            </h2>
            <div className="space-y-1">
              {tabEntries
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
        {open ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
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
                    <p className="text-sm text-foreground whitespace-pre-wrap">{v}</p>
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
