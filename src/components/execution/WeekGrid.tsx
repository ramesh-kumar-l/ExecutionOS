import { useRef, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useWeeklyStore } from "@/stores/weeklyStore";
import { CreateBlockModal } from "@/components/execution/CreateBlockModal";
import { cn } from "@/lib/utils";
import type { TimeBlock } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_START = 6;
const HOUR_END = 22;
const PX_PER_MIN = 1.5;
const HOUR_H = 60 * PX_PER_MIN;
const TOTAL_H = (HOUR_END - HOUR_START) * HOUR_H;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BLOCK_COLORS: Record<string, string> = {
  deep_work: "bg-accent/20 text-accent",
  shallow: "bg-secondary text-foreground",
  meeting: "bg-purple-500/15 text-purple-400",
  ritual: "bg-green-500/15 text-green-400",
  rest: "bg-muted text-muted-foreground",
  buffer: "bg-muted/40 text-muted-foreground",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeMins(t: string): number {
  const [h = "0", m = "0"] = t.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function pxToSnappedMins(px: number): number {
  const raw = HOUR_START * 60 + px / PX_PER_MIN;
  const snapped = Math.round(raw / 15) * 15;
  return Math.max(HOUR_START * 60, Math.min(HOUR_END * 60, snapped));
}

function minsToTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function formatHour(h: number): string {
  return h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`;
}

function addDaysToDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function isTodayStr(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

// ─── WeekBlockCard ─────────────────────────────────────────────────────────────

function WeekBlockCard({ block }: { block: TimeBlock }) {
  const startMins = timeMins(block.start_time);
  const endMins = timeMins(block.end_time);
  const top = (startMins - HOUR_START * 60) * PX_PER_MIN;
  const height = Math.max((endMins - startMins) * PX_PER_MIN, 14);
  const done = block.status === "completed" || block.status === "skipped";

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded overflow-hidden select-none pointer-events-none",
        BLOCK_COLORS[block.block_type] ?? "bg-muted text-muted-foreground",
        done && "opacity-35"
      )}
      style={{ top, height }}
    >
      <div className="px-1 py-0.5 overflow-hidden">
        <p className="text-[9px] font-medium leading-tight truncate">{block.title}</p>
        {height >= 30 && (
          <p className="text-[8px] opacity-60 truncate">
            {block.start_time}–{block.end_time}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── DayColumn ────────────────────────────────────────────────────────────────

interface DayColumnProps {
  date: string;
  dayIdx: number;
  blocks: TimeBlock[];
  ghost: { startMins: number; currentMins: number } | null;
  onMouseDown: (date: string, el: HTMLDivElement, e: React.MouseEvent) => void;
}

function DayColumn({ date, blocks, ghost, onMouseDown }: DayColumnProps) {
  const colRef = useRef<HTMLDivElement>(null);
  const isToday = isTodayStr(date);

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const showNow = isToday && nowMins >= HOUR_START * 60 && nowMins < HOUR_END * 60;
  const nowTop = (nowMins - HOUR_START * 60) * PX_PER_MIN;

  const ghostTop = ghost
    ? (Math.min(ghost.startMins, ghost.currentMins) - HOUR_START * 60) * PX_PER_MIN
    : 0;
  const ghostH = ghost ? Math.abs(ghost.currentMins - ghost.startMins) * PX_PER_MIN : 0;

  return (
    <div
      ref={colRef}
      className={cn(
        "relative flex-1 border-l border-border cursor-crosshair select-none",
        isToday && "bg-accent/[0.03]"
      )}
      onMouseDown={(e) => colRef.current && onMouseDown(date, colRef.current, e)}
    >
      {/* Gridlines */}
      {HOURS.map((h) => (
        <div key={h}>
          <div
            className="absolute left-0 right-0 border-t border-border/20"
            style={{ top: (h - HOUR_START) * HOUR_H }}
          />
          <div
            className="absolute left-0 right-0 border-t border-border/10"
            style={{ top: (h - HOUR_START) * HOUR_H + HOUR_H / 2 }}
          />
        </div>
      ))}

      {/* Ghost drag selection */}
      {ghost && ghostH >= 8 && (
        <div
          className="absolute left-0.5 right-0.5 bg-accent/20 border border-accent/40 rounded pointer-events-none z-10"
          style={{ top: ghostTop, height: ghostH }}
        >
          {ghostH >= 20 && (
            <div className="flex items-center gap-0.5 px-1 py-0.5">
              <Plus size={8} className="text-accent opacity-80" />
              <span className="text-[8px] text-accent">
                {minsToTime(Math.min(ghost.startMins, ghost.currentMins))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Time blocks */}
      {blocks.map((block) => (
        <WeekBlockCard key={block.id} block={block} />
      ))}

      {/* Now indicator */}
      {showNow && (
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
          style={{ top: nowTop }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent -ml-0.5 shrink-0" />
          <div className="flex-1 h-px bg-accent opacity-60" />
        </div>
      )}
    </div>
  );
}

// ─── WeekGrid ─────────────────────────────────────────────────────────────────

interface WeekGridProps {
  weekStart: string;
  isLoading: boolean;
}

type DragVisual = { date: string; startMins: number; currentMins: number };
type ModalState = { date: string; startTime: string; endTime: string };

export function WeekGrid({ weekStart, isLoading }: WeekGridProps) {
  const blocksByDate = useWeeklyStore((s) => s.blocksByDate);
  const addBlockForDate = useWeeklyStore((s) => s.addBlockForDate);

  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const dragColRef = useRef<HTMLDivElement | null>(null);
  const dragDataRef = useRef<DragVisual | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDaysToDate(weekStart, i));

  const handleColumnMouseDown = useCallback(
    (date: string, el: HTMLDivElement, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const startMins = pxToSnappedMins(e.clientY - rect.top);

      dragColRef.current = el;
      dragDataRef.current = { date, startMins, currentMins: startMins };
      setDragVisual({ date, startMins, currentMins: startMins });

      const onMove = (ev: MouseEvent) => {
        if (!dragColRef.current || !dragDataRef.current) return;
        const r = dragColRef.current.getBoundingClientRect();
        const currentMins = pxToSnappedMins(ev.clientY - r.top);
        dragDataRef.current = { ...dragDataRef.current, currentMins };
        setDragVisual({ ...dragDataRef.current });
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        const data = dragDataRef.current;
        dragColRef.current = null;
        dragDataRef.current = null;
        setDragVisual(null);
        if (!data) return;
        const from = Math.min(data.startMins, data.currentMins);
        const to = Math.max(data.startMins, data.currentMins);
        setModal({
          date: data.date,
          startTime: minsToTime(from),
          endTime: to - from >= 15 ? minsToTime(to) : "",
        });
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    []
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Day header row */}
      <div className="flex shrink-0 border-b border-border bg-card">
        <div className="w-14 shrink-0" />
        {days.map((date, i) => {
          const isToday = isTodayStr(date);
          const d = new Date(date + "T12:00:00");
          return (
            <div
              key={date}
              className={cn(
                "flex-1 border-l border-border py-2 text-center min-w-[80px]",
                isToday && "bg-accent/[0.04]"
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-medium leading-tight",
                  isToday ? "text-accent" : "text-muted-foreground"
                )}
              >
                {DAY_LABELS[i]}
              </p>
              <p
                className={cn(
                  "text-xs font-semibold mt-0.5",
                  isToday ? "text-accent" : "text-foreground"
                )}
              >
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground text-sm">Loading…</div>
          </div>
        ) : (
          <div
            className="flex"
            style={{ height: TOTAL_H, minWidth: `calc(80px * 7 + 56px)` }}
          >
            {/* Hour labels */}
            <div className="relative w-14 shrink-0">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full flex items-start justify-end pr-2 text-[10px] text-muted-foreground/50 font-mono"
                  style={{ top: (h - HOUR_START) * HOUR_H }}
                >
                  <span className="-mt-2">{formatHour(h)}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((date, i) => (
              <DayColumn
                key={date}
                date={date}
                dayIdx={i}
                blocks={blocksByDate[date] ?? []}
                ghost={
                  dragVisual?.date === date
                    ? { startMins: dragVisual.startMins, currentMins: dragVisual.currentMins }
                    : null
                }
                onMouseDown={handleColumnMouseDown}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <CreateBlockModal
          open={true}
          onClose={() => setModal(null)}
          date={modal.date}
          defaultStartTime={modal.startTime}
          defaultEndTime={modal.endTime || undefined}
          onBlockCreated={(block) => addBlockForDate(modal.date, block)}
        />
      )}
    </div>
  );
}
