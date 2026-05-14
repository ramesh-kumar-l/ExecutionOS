import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "text-green-400",
  error: "text-destructive",
  warning: "text-yellow-400",
  info: "text-accent",
};

function Toast({ id, type, message }: { id: string; type: string; message: string }) {
  const dismiss = useAppStore((s) => s.dismissNotification);
  const Icon = ICONS[type as keyof typeof ICONS] ?? Info;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), 4500);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-xl shadow-black/20 min-w-[280px] max-w-sm"
    >
      <Icon size={15} className={cn(COLORS[type as keyof typeof COLORS] ?? "text-muted-foreground")} />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <button
        onClick={() => dismiss(id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const notifications = useAppStore((s) => s.notifications);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <Toast id={n.id} type={n.type} message={n.message} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
