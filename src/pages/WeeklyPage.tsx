import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, addDays, addWeeks, startOfWeek } from "date-fns";
import { slideUp } from "@/lib/animations";
import { useWeeklyStore } from "@/stores/weeklyStore";
import { WeekGrid } from "@/components/execution/WeekGrid";
import { Button } from "@/components/ui/button";

export function WeeklyPage() {
  const { weekStart, setWeekStart, loadWeek, isLoading } = useWeeklyStore();

  useEffect(() => {
    void loadWeek(weekStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateWeek = (delta: number) => {
    const d = addWeeks(parseISO(weekStart), delta);
    setWeekStart(format(d, "yyyy-MM-dd"));
  };

  const goThisWeek = () => {
    setWeekStart(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  };

  const startDate = parseISO(weekStart);
  const endDate = addDays(startDate, 6);
  const sameMonth = format(startDate, "MMM") === format(endDate, "MMM");
  const rangeLabel = sameMonth
    ? `${format(startDate, "MMM d")} – ${format(endDate, "d, yyyy")}`
    : `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Weekly Plan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goThisWeek}
            className="text-xs px-2.5"
          >
            This week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <WeekGrid weekStart={weekStart} isLoading={isLoading} />
      </div>
    </motion.div>
  );
}
