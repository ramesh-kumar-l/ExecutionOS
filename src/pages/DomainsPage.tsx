import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Pencil } from "lucide-react";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useDomainsStore } from "@/stores/domainsStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Domain } from "@/types";

function DomainEditDialog({
  open,
  domain,
  onClose,
}: {
  open: boolean;
  domain: Domain | null;
  onClose: () => void;
}) {
  const updateDomain = useDomainsStore((s) => s.updateDomain);
  const [vision, setVision] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");

  // Sync local state when domain changes
  useEffect(() => {
    if (domain) {
      setVision(domain.vision);
      setPurpose(domain.purpose);
      setStatus(domain.current_status);
    }
  }, [domain]);

  const handleSave = () => {
    if (!domain) return;
    void updateDomain(domain.id, { vision, purpose, current_status: status });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={domain?.name ?? ""}
      description="Update your vision and current status for this life domain."
    >
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block">Vision</Label>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="What does excellence look like in this domain?"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
          />
        </div>

        <div>
          <Label className="mb-1.5 block">Purpose</Label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Why does this domain matter to you?"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
          />
        </div>

        <div>
          <Label className="mb-1.5 block">Current status</Label>
          <textarea
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Where are you right now in this domain?"
            className="w-full text-sm rounded-md border border-border bg-background px-3 py-2 resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:opacity-40 text-foreground"
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export function DomainsPage() {
  const domains = useDomainsStore((s) => s.domains.filter((d) => d.is_active));
  const isLoading = useDomainsStore((s) => s.isLoading);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingDomain = domains.find((d) => d.id === editingId) ?? null;

  return (
    <>
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
                    "p-4 rounded-xl border border-border bg-card group",
                    "hover:border-accent/30 transition-colors"
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                    >
                      <span className="text-sm">●</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-mono text-muted-foreground">
                        {domain.health_score}
                      </div>
                      <button
                        onClick={() => setEditingId(domain.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all"
                        title="Edit domain"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-medium text-foreground">{domain.name}</h3>

                  {domain.vision ? (
                    <p
                      className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setEditingId(domain.id)}
                      title="Click to edit vision"
                    >
                      {domain.vision}
                    </p>
                  ) : (
                    <p
                      className="text-xs text-muted-foreground/35 mt-1 italic cursor-pointer hover:text-muted-foreground/60 transition-colors"
                      onClick={() => setEditingId(domain.id)}
                    >
                      Set vision…
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

      <DomainEditDialog
        open={editingDomain !== null}
        domain={editingDomain}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
