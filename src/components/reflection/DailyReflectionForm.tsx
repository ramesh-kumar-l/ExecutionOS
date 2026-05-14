import { useState, type FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReflectionStore } from "@/stores/reflectionStore";

const FIELDS = [
  { key: "gratitude", label: "What am I grateful for today?", placeholder: "Three things…" },
  { key: "highlights", label: "What went well?", placeholder: "Wins, progress, moments…" },
  { key: "challenges", label: "What was difficult?", placeholder: "Obstacles, friction, setbacks…" },
  { key: "improvements", label: "What would I do differently?", placeholder: "Lessons, adjustments…" },
  { key: "tomorrow_intention", label: "Intention for tomorrow", placeholder: "One clear focus…" },
] as const;

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
              value >= n
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  onSuccess?: () => void;
}

export function DailyReflectionForm({ onSuccess }: Props) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const createEntry = useReflectionStore((s) => s.createEntry);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await createEntry({ type: "daily", content, mood, energy });
    setSubmitting(false);
    if (result) {
      setContent({});
      setMood(3);
      setEnergy(3);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`rf-${key}`}>{label}</Label>
          <Textarea
            id={`rf-${key}`}
            placeholder={placeholder}
            value={content[key] ?? ""}
            onChange={(e) => setContent((c) => ({ ...c, [key]: e.target.value }))}
            rows={2}
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4 pt-1">
        <RatingRow label="Mood (1–5)" value={mood} onChange={setMood} />
        <RatingRow label="Energy (1–5)" value={energy} onChange={setEnergy} />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save reflection"}
        </Button>
      </div>
    </form>
  );
}
