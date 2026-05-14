import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useGoalsStore } from "@/stores/goalsStore";
import { useDomainsStore } from "@/stores/domainsStore";
import type { GoalPriority } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DEFAULTS = {
  title: "",
  description: "",
  domain_id: "",
  target_date: "",
  priority: "high" as GoalPriority,
  success_criteria: "",
};

export function CreateGoalModal({ open, onClose }: Props) {
  const [form, setForm] = useState(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const createGoal = useGoalsStore((s) => s.createGoal);
  const domains = useDomainsStore((s) => s.domains.filter((d) => d.is_active));

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.domain_id) return;
    setSubmitting(true);
    const result = await createGoal({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      domain_id: form.domain_id,
      target_date: form.target_date || undefined,
      priority: form.priority,
      success_criteria: form.success_criteria.trim() || undefined,
    });
    setSubmitting(false);
    if (result) {
      setForm(DEFAULTS);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Goal"
      description="Define a strategic goal tied to a life domain."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="g-title">Title *</Label>
          <Input
            id="g-title"
            placeholder="What do you want to achieve?"
            value={form.title}
            onChange={set("title")}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="g-domain">Domain *</Label>
            <Select id="g-domain" value={form.domain_id} onChange={set("domain_id")}>
              <option value="">Select domain…</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="g-priority">Priority</Label>
            <Select id="g-priority" value={form.priority} onChange={set("priority")}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-date">Target date</Label>
          <Input id="g-date" type="date" value={form.target_date} onChange={set("target_date")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-success">Success criteria</Label>
          <Textarea
            id="g-success"
            placeholder="How will you know you've succeeded?"
            value={form.success_criteria}
            onChange={set("success_criteria")}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-desc">Description</Label>
          <Textarea
            id="g-desc"
            placeholder="Additional context (optional)"
            value={form.description}
            onChange={set("description")}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!form.title.trim() || !form.domain_id || submitting}>
            {submitting ? "Creating…" : "Create goal"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
