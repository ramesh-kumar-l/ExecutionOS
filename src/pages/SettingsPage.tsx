import { motion } from "framer-motion";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const themes = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsPage() {
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
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Appearance
            </h2>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                  {themes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                        value === "dark"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              AI (Ollama)
            </h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-foreground">Ollama URL</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Local AI inference server</p>
                </div>
                <input
                  type="text"
                  defaultValue="http://localhost:11434"
                  className="text-sm bg-muted border border-border rounded-md px-3 py-1.5 text-foreground w-48 outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-foreground">AI Features</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable AI-powered insights</p>
                </div>
                <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-accent transition-colors">
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform translate-x-4" />
                </button>
              </div>
            </div>
          </section>

          {/* App info */}
          <section>
            <div className="text-xs text-muted-foreground/50 text-center">
              LENSSTACK v0.1.0 · Offline-first · Local-only
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
