import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useKnowledgeStore } from "@/stores/knowledgeStore";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { KnowledgeNote, NoteType } from "@/types";

const TYPE_LABELS: Record<NoteType, string> = {
  note: "Note",
  learning: "Learning",
  book: "Book",
  decision: "Decision",
  resource: "Resource",
  synthesis: "Synthesis",
};

const TYPE_VARIANT: Record<NoteType, "default" | "secondary" | "destructive"> = {
  note: "secondary",
  learning: "default",
  book: "secondary",
  decision: "destructive",
  resource: "secondary",
  synthesis: "default",
};

interface Props {
  note: KnowledgeNote;
}

export function NoteCard({ note }: Props) {
  const [expanded, setExpanded] = useState(false);
  const deleteNote = useKnowledgeStore((s) => s.deleteNote);

  const noteType = note.type as NoteType;

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
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={TYPE_VARIANT[noteType] ?? "secondary"}>
              {TYPE_LABELS[noteType] ?? note.type}
            </Badge>
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
          {note.content && !expanded && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {note.content}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {format(parseISO(note.updated_at), "MMM d")}
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
            <div className="px-4 py-4 space-y-3">
              {note.content && (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              )}

              {note.source && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink size={11} />
                  <span className="truncate">{note.source}</span>
                </div>
              )}

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-border">
                <span className="text-[10px] text-muted-foreground/50">
                  {format(parseISO(note.created_at), "MMMM d, yyyy")}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteNote(note.id);
                  }}
                  className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors"
                  title="Delete note"
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
