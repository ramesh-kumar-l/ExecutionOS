import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContextStore } from "@/stores/contextStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function CreateSnapshotModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [contextText, setContextText] = useState("");
  const [openThreads, setOpenThreads] = useState("");
  const [decisions, setDecisions] = useState("");
  const [nextActions, setNextActions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createSnapshot = useContextStore((s) => s.createSnapshot);

  const reset = () => {
    setTitle("");
    setContextText("");
    setOpenThreads("");
    setDecisions("");
    setNextActions("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const result = await createSnapshot({
      title: title.trim(),
      context_text: contextText.trim(),
      open_threads: parseLines(openThreads),
      decisions: parseLines(decisions),
      next_actions: parseLines(nextActions),
    });
    setSubmitting(false);
    if (result) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Save Context Snapshot"
      description="Capture where you are before you stop. You'll restore this instantly next time."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="snap-title" className="mb-1.5 block">
            What were you working on? <span className="text-destructive">*</span>
          </Label>
          <input
            id="snap-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 product strategy session"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="snap-context" className="mb-1.5 block">
            Context
          </Label>
          <Textarea
            id="snap-context"
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Describe the state of the work — what you were analyzing, building, or deciding…"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="snap-threads" className="mb-1.5 block">
            Open Threads
            <span className="text-muted-foreground font-normal ml-1.5 text-xs">(one per line)</span>
          </Label>
          <Textarea
            id="snap-threads"
            value={openThreads}
            onChange={(e) => setOpenThreads(e.target.value)}
            placeholder={"Pricing model unresolved\nNeed design input on onboarding flow"}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="snap-decisions" className="mb-1.5 block">
            Key Decisions Made
            <span className="text-muted-foreground font-normal ml-1.5 text-xs">(one per line)</span>
          </Label>
          <Textarea
            id="snap-decisions"
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
            placeholder={"Going with freemium model\nDelayed feature X to Q4"}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="snap-actions" className="mb-1.5 block">
            Next Actions
            <span className="text-muted-foreground font-normal ml-1.5 text-xs">(one per line)</span>
          </Label>
          <Textarea
            id="snap-actions"
            value={nextActions}
            onChange={(e) => setNextActions(e.target.value)}
            placeholder={"Draft pricing page copy\nSchedule design sync"}
            rows={2}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || submitting}>
            {submitting ? "Saving…" : "Save snapshot"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
