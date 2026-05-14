import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, X, Plus } from "lucide-react";
import { useExecutionStore } from "@/stores/executionStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { cn } from "@/lib/utils";
import type { TimeBlock } from "@/types";

const HOUR_START = 6;
const HOUR_END = 22;
const PX_PER_MIN = 1.5;
const HOUR_H = 60 * PX_PER_MIN;

const BLOCK_COLORS: Record<string, string> = {
  deep_work: "bg-accent/15 border-accent/30 text-accent",
  shallow: "bg-secondary border-border text-foreground",
  meeting: "bg-purple-500/12 border-purple-500/25 text-purple-400",
  ritual: "bg-green-500/12 border-green-500/25 text-green-400",
  rest: "bg-muted border-border text-muted-foreground",
  buffer: "bg-muted/40 border-dashed border-border text-muted-foreground",
};

const BLOCK_LABELS: Record<string, string> = {
  deep_work: "Deep Work",
  shallow: "Shallow",
  meeting: "Meeting",
  ritual: "Ritual",
  rest: "Rest",
  buffer: "Buffer",
};

function timeMins(t: string): number {
  const parts = t.split(":");
  return parseInt(parts[0] ?? "0", 10) * 60 + parseInt(parts[1] ?? "0", 10);
}

function BlockCard({
  block,
  onComplete,
  onSkip,
}: {
  block: TimeBlock;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const goal = useGoalsStore((s) =>
    block.goal_id ? s.goals.find((g) => g.id === block.goal_id) : undefined
  );

  const startMins = timeMins(block.start_time);
  const endMins = timeMins(block.end_time);
  const top = (startMins - HOUR_START * 60) * PX_PER_MIN;
  const height = Math.max((endMins - startMins) * PX_PER_MIN, 24);
  const done = block.status === "completed" || block.status === "skipped";

  return (
    <div
      className={cn(
        "absolute left-2 right-2 rounded-md border px-2.5 py-1.5 overflow-hidden group cursor-default select-none transition-opacity",
        BLOCK_COLORS[block.block_type] ?? "bg-muted border-border",
        done && "opacity-35"
      )}
      style={{ top, height }}
    >
      <div className="flex items-start justify-between gap-1 h-full">
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className={cn("font-medium leading-tight truncate", height < 32 ? "text-[10px]" : "text-xs")}>
            {block.title}
          </p>
          {height >= 40 && (
            <p className="text-[10px] opacity-55 mt-0.5 truncate">
              {BLOCK_LABELS[block.block_type]} · {block.start_time}–{block.end_time}
            </p>
          )}
          {height >= 56 && goal && (
            <p className="text-[10px] opacity-50 mt-0.5 truncate">{goal.title}</p>
          )}
        </div>

        {!done && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 mt-0.5">
            <button
              onClick={() => onComplete(block.id)}
              className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
              title="Mark done"
            >
              <Check size={10} />
            </button>
            <button
              onClick={() => onSkip(block.id)}
              className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
              title="Skip"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DailyGridProps {
  date: string;
  onCreateBlock: (startTime: string) => void;
}

export function DailyGrid({ date, onCreateBlock }: DailyGridProps) {
  const blocks = useExecutionStore((s) => s.blocks);
  const completeBlock = useExecutionStore((s) => s.completeBlock);
  const skipBlock = useExecutionStore((s) => s.skipBlock);
  const [hovered, setHovered] = useState<number | null>(null);

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    []
  );

  const totalH = (HOUR_END - HOUR_START) * HOUR_H;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const nowTop = (nowMins - HOUR_START * 60) * PX_PER_MIN;
  const showNow =
    date === format(now, "yyyy-MM-dd") &&
    nowMins >= HOUR_START * 60 &&
    nowMins < HOUR_END * 60;

  const formatHour = (h: number) =>
    h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`;

  return (
    <div className="flex overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
      {/* Hour labels */}
      <div className="flex flex-col shrink-0 w-14 select-none">
        {hours.map((h) => (
          <div
            key={h}
            className="flex items-start justify-end pr-3 text-[10px] text-muted-foreground/50 font-mono"
            style={{ height: HOUR_H }}
          >
            <span className="-mt-2">{formatHour(h)}</span>
          </div>
        ))}
      </div>

      {/* Grid column */}
      <div className="relative flex-1 border-l border-border" style={{ height: totalH }}>
        {/* Gridlines */}
        {hours.map((h) => (
          <div key={h}>
            <div
              className="absolute left-0 right-0 border-t border-border/25"
              style={{ top: (h - HOUR_START) * HOUR_H }}
            />
            <div
              className="absolute left-0 right-0 border-t border-border/10"
              style={{ top: (h - HOUR_START) * HOUR_H + HOUR_H / 2 }}
            />
          </div>
        ))}

        {/* Click zones — one per hour */}
        {hours.map((h) => (
          <div
            key={`z-${h}`}
            className={cn(
              "absolute left-0 right-0 cursor-pointer transition-colors",
              hovered === h && "bg-accent/4"
            )}
            style={{ top: (h - HOUR_START) * HOUR_H, height: HOUR_H }}
            onMouseEnter={() => setHovered(h)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onCreateBlock(`${String(h).padStart(2, "0")}:00`)}
          >
            {hovered === h && (
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground/30 pointer-events-none">
                <Plus size={11} />
                <span className="text-[10px]">Add block</span>
              </div>
            )}
          </div>
        ))}

        {/* Time blocks */}
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            onComplete={completeBlock}
            onSkip={skipBlock}
          />
        ))}

        {/* Now indicator */}
        {showNow && (
          <div
            className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
            style={{ top: nowTop }}
          >
            <div className="w-2 h-2 rounded-full bg-accent -ml-1 shrink-0" />
            <div className="flex-1 h-px bg-accent opacity-70" />
          </div>
        )}
      </div>
    </div>
  );
}
