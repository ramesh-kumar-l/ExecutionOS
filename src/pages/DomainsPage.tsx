import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useDomainsStore } from "@/stores/domainsStore";
import { cn } from "@/lib/utils";

export function DomainsPage() {
  const domains = useDomainsStore((s) => s.domains.filter((d) => d.is_active));
  const isLoading = useDomainsStore((s) => s.isLoading);

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full overflow-y-auto selectable"
    >
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Life Domains</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The 12 dimensions of your intentional life
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : domains.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <LayoutGrid size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No domains configured.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-3 gap-3"
          >
            {domains.map((domain) => (
              <motion.div
                key={domain.id}
                variants={slideUp}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card",
                  "hover:border-accent/30 transition-colors cursor-default"
                )}
              >
                {/* Health indicator */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                  >
                    <span className="text-sm">●</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {domain.health_score}
                  </div>
                </div>

                <h3 className="text-sm font-medium text-foreground">{domain.name}</h3>

                {domain.vision ? (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {domain.vision}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/40 mt-1 italic">
                    No vision set
                  </p>
                )}

                {/* Health bar */}
                <div className="mt-3 h-0.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${domain.health_score}%`,
                      backgroundColor: domain.color,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
