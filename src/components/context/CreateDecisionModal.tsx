import { useState, type FormEvent } from "react";
import { format } from "date-fns";
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

export function CreateDecisionModal({ open, onClose }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [rationale, setRationale] = useState("");
  const [options, setOptions] = useState("");
  const [decidedAt, setDecidedAt] = useState(today);
  const [reviewDate, setReviewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createDecision = useContextStore((s) => s.createDecision);

  const reset = () => {
    setTitle("");
    setContext("");
    setRationale("");
    setOptions("");
    setDecidedAt(today);
    setReviewDate("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decidedAt) return;
    setSubmitting(true);
    const result = await createDecision({
      title: title.trim(),
      context: context.trim() || undefined,
      rationale: rationale.trim() || undefined,
      options: parseLines(options).length > 0 ? parseLines(options) : undefined,
      decided_at: decidedAt,
      review_date: reviewDate || undefined,
    });
    setSubmitting(false);
    if (result) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Log a Decision"
      description="Record a key decision with its rationale for future reference."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="dec-title" className="mb-1.5 block">
            Decision <span className="text-destructive">*</span>
          </Label>
          <input
            id="dec-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chose SQLite over PostgreSQL"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="dec-context" className="mb-1.5 block">
            Context
          </Label>
          <Textarea
            id="dec-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What situation or problem prompted this decision?"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="dec-options" className="mb-1.5 block">
            Options Considered
            <span className="text-muted-foreground font-normal ml-1.5 text-xs">(one per line)</span>
          </Label>
          <Textarea
            id="dec-options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder={"SQLite\nPostgreSQL\nDuckDB"}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="dec-rationale" className="mb-1.5 block">
            Rationale
          </Label>
          <Textarea
            id="dec-rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why this option? What trade-offs were accepted?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dec-date" className="mb-1.5 block">
              Date Decided <span className="text-destructive">*</span>
            </Label>
            <input
              id="dec-date"
              type="date"
              value={decidedAt}
              onChange={(e) => setDecidedAt(e.target.value)}
              className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="dec-review" className="mb-1.5 block">
              Review Date
            </Label>
            <input
              id="dec-review"
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || !decidedAt || submitting}>
            {submitting ? "Saving…" : "Log decision"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
