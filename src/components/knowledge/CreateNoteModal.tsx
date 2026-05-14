import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useKnowledgeStore } from "@/stores/knowledgeStore";
import { cn } from "@/lib/utils";
import type { NoteType } from "@/types";

const NOTE_TYPES: { value: NoteType; label: string; desc: string }[] = [
  { value: "note", label: "Note", desc: "General capture" },
  { value: "learning", label: "Learning", desc: "Insight or lesson" },
  { value: "book", label: "Book", desc: "Book summary or notes" },
  { value: "resource", label: "Resource", desc: "Link, tool, or reference" },
  { value: "synthesis", label: "Synthesis", desc: "Connection across ideas" },
  { value: "decision", label: "Decision", desc: "Decision with rationale" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateNoteModal({ open, onClose }: Props) {
  const [noteType, setNoteType] = useState<NoteType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createNote = useKnowledgeStore((s) => s.createNote);

  const reset = () => {
    setNoteType("note");
    setTitle("");
    setContent("");
    setTagsInput("");
    setSource("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const result = await createNote({
      note_type: noteType,
      title: title.trim(),
      content: content.trim(),
      tags,
      source: source.trim() || undefined,
    });
    setSubmitting(false);
    if (result) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="New Note"
      description="Capture a thought, learning, or resource."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <Label className="mb-2 block">Type</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {NOTE_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setNoteType(value)}
                className={cn(
                  "px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-left",
                  noteType === value
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="note-title" className="mb-1.5 block">
            Title <span className="text-destructive">*</span>
          </Label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this about?"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
            autoFocus
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="note-content" className="mb-1.5 block">
            Content
          </Label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              noteType === "book"
                ? "Key ideas, quotes, and takeaways…"
                : noteType === "decision"
                ? "Context, options considered, rationale…"
                : noteType === "learning"
                ? "What did you learn? Why does it matter?"
                : "Your thoughts…"
            }
            rows={4}
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="note-tags" className="mb-1.5 block">
            Tags
          </Label>
          <input
            id="note-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="habits, productivity, mindset (comma-separated)"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
          />
        </div>

        {/* Source */}
        {(noteType === "book" || noteType === "resource") && (
          <div>
            <Label htmlFor="note-source" className="mb-1.5 block">
              Source
            </Label>
            <input
              id="note-source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={noteType === "book" ? "Author / Title" : "URL or reference"}
              className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || submitting}>
            {submitting ? "Saving…" : "Save note"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
