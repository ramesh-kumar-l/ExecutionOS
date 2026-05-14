import { motion } from "framer-motion";
import { Sparkles, RotateCcw, WifiOff, AlertTriangle } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useAiStore } from "@/stores/aiStore";
import { Button } from "@/components/ui/button";

export function AiBriefingPanel() {
  const {
    isConnected,
    isCheckingConnection,
    briefing,
    isLoadingBriefing,
    checkConnection,
    loadBriefing,
  } = useAiStore();

  const refresh = async () => {
    const connected = await checkConnection();
    if (connected) await loadBriefing();
  };

  if (isCheckingConnection) {
    return (
      <div className="rounded-lg border border-border bg-card/50 p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
          Connecting to AI…
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border bg-card/50 px-4 py-3 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs">
          <WifiOff size={12} />
          AI offline — start Ollama to enable daily briefings
        </div>
      </div>
    );
  }

  if (isLoadingBriefing) {
    return (
      <div className="rounded-lg border border-border bg-card/50 p-4 mb-6 space-y-2.5">
        <div className="h-3 w-2/3 bg-muted/50 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted/50 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted/50 rounded animate-pulse" />
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="rounded-lg border border-accent/20 bg-accent/5 p-4 mb-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5 min-w-0">
          <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground mb-2">{briefing.focus}</p>

            {briefing.alert && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-2">
                <AlertTriangle size={11} className="shrink-0" />
                {briefing.alert}
              </div>
            )}

            {briefing.key_blocks.length > 0 && (
              <ul className="space-y-0.5 mb-2">
                {briefing.key_blocks.map((block, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-accent/60 shrink-0 mt-px">·</span>
                    {block}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-muted-foreground italic">{briefing.question}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refresh()}
          className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          title="Refresh briefing"
        >
          <RotateCcw size={12} />
        </Button>
      </div>
    </motion.div>
  );
}
