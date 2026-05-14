import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { format } from "date-fns";

export function ReflectionPage() {
  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full overflow-y-auto selectable"
    >
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Reflection</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <PenLine size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reflection for today yet.</p>
          <button className="mt-4 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-colors">
            Start daily reflection
          </button>
        </div>
      </div>
    </motion.div>
  );
}
