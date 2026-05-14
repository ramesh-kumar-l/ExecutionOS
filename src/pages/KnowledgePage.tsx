import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Search, X } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useKnowledgeStore } from "@/stores/knowledgeStore";
import { NoteCard } from "@/components/knowledge/NoteCard";
import { CreateNoteModal } from "@/components/knowledge/CreateNoteModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NoteType } from "@/types";

const TYPE_FILTERS: { value: NoteType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "learning", label: "Learnings" },
  { value: "book", label: "Books" },
  { value: "resource", label: "Resources" },
  { value: "synthesis", label: "Synthesis" },
  { value: "decision", label: "Decisions" },
];

export function KnowledgePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const { notes, isLoading, filterType, loadNotes, setFilterType } = useKnowledgeStore();

  const reload = useCallback(
    (q: string, type: NoteType | "all") => {
      void loadNotes({
        search: q || undefined,
        note_type: type !== "all" ? type : undefined,
      });
    },
    [loadNotes]
  );

  useEffect(() => {
    reload("", "all");
  }, [reload]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      reload(localSearch, filterType);
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, filterType, reload]);

  const handleFilterType = (type: NoteType | "all") => {
    setFilterType(type);
    reload(localSearch, type);
  };

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
              <h1 className="text-2xl font-semibold text-foreground">Knowledge</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              New note
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full text-sm rounded-lg border border-border bg-card pl-9 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {TYPE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterType(value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  filterType === value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Notes list */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <BookOpen
                size={32}
                className="text-muted-foreground/30 mx-auto mb-3"
              />
              <p className="text-sm text-muted-foreground">
                {localSearch
                  ? `No notes matching "${localSearch}".`
                  : "No notes yet. Capture your first thought."}
              </p>
              {!localSearch && (
                <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus size={14} /> New note
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {notes.map((note) => (
                <motion.div key={note.id} variants={slideUp}>
                  <NoteCard note={note} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <CreateNoteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
