import { useState, useEffect, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useExecutionStore } from "@/stores/executionStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { todayIso } from "@/lib/utils";
import type { BlockType, EnergyType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultStartTime?: string;
  date?: string;
}

const DEFAULTS = {
  title: "",
  start_time: "09:00",
  end_time: "10:00",
  block_type: "deep_work" as BlockType,
  energy_type: "high" as EnergyType,
  goal_id: "",
};

function nextHour(startTime: string): string {
  const h = parseInt(startTime.split(":")[0] ?? "9", 10);
  return `${String(Math.min(h + 1, 23)).padStart(2, "0")}:00`;
}

export function CreateBlockModal({ open, onClose, defaultStartTime, date }: Props) {
  const [form, setForm] = useState(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const createBlock = useExecutionStore((s) => s.createBlock);
  const goals = useGoalsStore((s) => s.goals.filter((g) => g.status === "active"));

  useEffect(() => {
    if (open) {
      const start = defaultStartTime ?? "09:00";
      setForm({ ...DEFAULTS, start_time: start, end_time: nextHour(start) });
    }
  }, [open, defaultStartTime]);

  const patch = (key: keyof typeof DEFAULTS) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    const result = await createBlock({
      title: form.title.trim(),
      date: date ?? todayIso(),
      start_time: form.start_time,
      end_time: form.end_time,
      block_type: form.block_type,
      energy_type: form.energy_type,
      goal_id: form.goal_id || undefined,
    });
    setSubmitting(false);
    if (result) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Schedule Time Block"
      description="Add an intentional block to your day."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="b-title">Title *</Label>
          <Input
            id="b-title"
            placeholder="What will you do?"
            value={form.title}
            onChange={patch("title")}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="b-start">Start time</Label>
            <Input id="b-start" type="time" value={form.start_time} onChange={patch("start_time")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-end">End time</Label>
            <Input id="b-end" type="time" value={form.end_time} onChange={patch("end_time")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="b-type">Block type</Label>
            <Select id="b-type" value={form.block_type} onChange={patch("block_type")}>
              <option value="deep_work">Deep Work</option>
              <option value="shallow">Shallow Work</option>
              <option value="meeting">Meeting</option>
              <option value="ritual">Ritual</option>
              <option value="rest">Rest</option>
              <option value="buffer">Buffer</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-energy">Energy level</Label>
            <Select id="b-energy" value={form.energy_type} onChange={patch("energy_type")}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="b-goal">Link to goal (optional)</Label>
            <Select id="b-goal" value={form.goal_id} onChange={patch("goal_id")}>
              <option value="">No goal</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!form.title.trim() || submitting}>
            {submitting ? "Adding…" : "Add block"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
