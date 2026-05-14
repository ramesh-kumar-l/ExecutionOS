import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Plus, Camera, BookMarked } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useContextStore } from "@/stores/contextStore";
import { SnapshotCard } from "@/components/context/SnapshotCard";
import { DecisionCard } from "@/components/context/DecisionCard";
import { CreateSnapshotModal } from "@/components/context/CreateSnapshotModal";
import { CreateDecisionModal } from "@/components/context/CreateDecisionModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "snapshots" | "decisions";

export function ContextPage() {
  const [tab, setTab] = useState<Tab>("snapshots");
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);

  const {
    snapshots,
    decisions,
    isLoadingSnapshots,
    isLoadingDecisions,
    loadSnapshots,
    loadDecisions,
  } = useContextStore();

  useEffect(() => {
    void loadSnapshots();
    void loadDecisions();
  }, [loadSnapshots, loadDecisions]);

  const isLoading = tab === "snapshots" ? isLoadingSnapshots : isLoadingDecisions;

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Context Engine</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Preserve cognitive continuity across sessions
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDecisionOpen(true)}>
                <BookMarked size={14} />
                Log decision
              </Button>
              <Button size="sm" onClick={() => setSnapshotOpen(true)}>
                <Camera size={14} />
                Save context
              </Button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg mb-6 w-fit">
            {(["snapshots", "decisions"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "snapshots" ? (
                  <span className="flex items-center gap-1.5">
                    <Camera size={13} />
                    Snapshots
                    {snapshots.length > 0 && (
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                        {snapshots.length}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <BookMarked size={13} />
                    Decisions
                    {decisions.length > 0 && (
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                        {decisions.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : tab === "snapshots" ? (
            snapshots.length === 0 ? (
              <EmptyState
                icon={<Camera size={32} className="text-muted-foreground/30 mx-auto mb-3" />}
                title="No context snapshots yet."
                description="Save your current mental state before stopping work. Resume instantly next time."
                action={
                  <Button size="sm" className="mt-4" onClick={() => setSnapshotOpen(true)}>
                    <Plus size={14} /> Save context
                  </Button>
                }
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-2"
              >
                {snapshots.map((snap) => (
                  <motion.div key={snap.id} variants={slideUp}>
                    <SnapshotCard snapshot={snap} />
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : decisions.length === 0 ? (
            <EmptyState
              icon={<BookMarked size={32} className="text-muted-foreground/30 mx-auto mb-3" />}
              title="No decisions logged yet."
              description="Record key decisions with their rationale. Build a searchable decision history."
              action={
                <Button size="sm" className="mt-4" onClick={() => setDecisionOpen(true)}>
                  <Plus size={14} /> Log decision
                </Button>
              }
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {decisions.map((dec) => (
                <motion.div key={dec.id} variants={slideUp}>
                  <DecisionCard decision={dec} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <CreateSnapshotModal open={snapshotOpen} onClose={() => setSnapshotOpen(false)} />
      <CreateDecisionModal open={decisionOpen} onClose={() => setDecisionOpen(false)} />
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center">
      {icon}
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
