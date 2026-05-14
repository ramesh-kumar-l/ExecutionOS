import { useState, useEffect, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRecurringStore } from "@/stores/recurringStore";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DURATIONS = [15, 30, 45, 60, 90, 120];
const PATTERNS = ["daily", "weekly", "monthly"] as const;

const DEFAULTS = {
  title: "",
  pattern: "daily" as (typeof PATTERNS)[number],
  days_of_week: [] as number[],
  start_time: "09:00",
  duration_minutes: 60,
  block_type: "deep_work" as BlockType,
};

export function CreateRuleModal({ open, onClose }: Props) {
  const [form, setForm] = useState(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const createRule = useRecurringStore((s) => s.createRule);

  useEffect(() => {
    if (open) setForm(DEFAULTS);
  }, [open]);

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter((d) => d !== day)
        : [...f.days_of_week, day].sort((a, b) => a - b),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.pattern === "weekly" && form.days_of_week.length === 0) return;
    setSubmitting(true);
    const result = await createRule({
      title: form.title.trim(),
      pattern: form.pattern,
      days_of_week: form.pattern === "weekly" ? form.days_of_week : [],
      start_time: form.start_time,
      duration_minutes: form.duration_minutes,
      block_type: form.block_type,
    });
    setSubmitting(false);
    if (result) onClose();
  };

  const isValid =
    form.title.trim() &&
    (form.pattern !== "weekly" || form.days_of_week.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Recurring Rule"
      description="Schedule a recurring time block that repeats automatically."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="r-title">Title *</Label>
          <Input
            id="r-title"
            placeholder="e.g. Morning deep work"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>Repeat pattern</Label>
          <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
            {PATTERNS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((f) => ({ ...f, pattern: p, days_of_week: [] }))}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs capitalize transition-colors",
                  form.pattern === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {form.pattern === "weekly" && (
          <div className="space-y-1.5">
            <Label>Days of week *</Label>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "w-10 h-9 rounded-md text-xs font-medium transition-colors",
                    form.days_of_week.includes(i)
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="r-time">Start time</Label>
            <Input
              id="r-time"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-duration">Duration</Label>
            <Select
              id="r-duration"
              value={String(form.duration_minutes)}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))
              }
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d < 60 ? `${d} min` : `${d / 60}h`}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="r-type">Block type</Label>
          <Select
            id="r-type"
            value={form.block_type}
            onChange={(e) =>
              setForm((f) => ({ ...f, block_type: e.target.value as BlockType }))
            }
          >
            <option value="deep_work">Deep Work</option>
            <option value="shallow">Shallow Work</option>
            <option value="meeting">Meeting</option>
            <option value="ritual">Ritual</option>
            <option value="rest">Rest</option>
            <option value="buffer">Buffer</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? "Creating…" : "Create rule"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
