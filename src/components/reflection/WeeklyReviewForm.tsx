import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useReflectionStore } from "@/stores/reflectionStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "wins",
    title: "Wins",
    prompt: "What went well this week?",
    placeholder: "Successes, progress, moments of flow…",
  },
  {
    key: "challenges",
    title: "Challenges",
    prompt: "What was difficult or blocked?",
    placeholder: "Obstacles, friction, things that didn't go as planned…",
  },
  {
    key: "learnings",
    title: "Learnings",
    prompt: "What did I learn?",
    placeholder: "Insights, realizations, knowledge gained…",
  },
  {
    key: "goal_notes",
    title: "Goal Progress",
    prompt: "How did your goals progress?",
    placeholder: "Which goals moved forward? Which stalled? Why?",
  },
  {
    key: "domain_notes",
    title: "Domain Check-in",
    prompt: "Which domains got attention? Which were neglected?",
    placeholder: "Health, relationships, career, finances, creativity…",
  },
  {
    key: "energy_notes",
    title: "Energy Pattern",
    prompt: "What drained you? What energized you?",
    placeholder: "Activities, people, environments that shifted your energy…",
  },
  {
    key: "next_intentions",
    title: "Next Week",
    prompt: "What are your 3 intentions for next week?",
    placeholder: "Three clear outcomes you want to achieve…",
  },
] as const;

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function WeeklyReviewForm({ onSuccess, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [content, setContent] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const createEntry = useReflectionStore((s) => s.createEntry);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      void handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await createEntry({ type: "weekly", content });
    setSubmitting(false);
    if (result) onSuccess();
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-0.5 rounded-full flex-1 transition-colors duration-300",
              i <= step ? "bg-accent" : "bg-border"
            )}
          />
        ))}
      </div>

      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Step {step + 1} of {STEPS.length} · {current.title}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.16 }}
        >
          <Label className="text-sm font-medium text-foreground mb-2.5 block">
            {current.prompt}
          </Label>
          <Textarea
            value={content[current.key] ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, [current.key]: e.target.value }))
            }
            placeholder={current.placeholder}
            rows={5}
            autoFocus
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
        >
          {step === 0 ? (
            "Cancel"
          ) : (
            <>
              <ChevronLeft size={14} />
              Back
            </>
          )}
        </Button>
        <Button size="sm" onClick={handleNext} disabled={submitting}>
          {isLast ? (
            submitting ? "Saving…" : "Save review"
          ) : (
            <>
              Next
              <ChevronRight size={14} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
