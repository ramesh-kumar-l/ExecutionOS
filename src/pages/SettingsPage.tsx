import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useSettingsStore } from "@/stores/settingsStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsPage() {
  const { settings, isLoading, loadSettings, updateSettings } = useSettingsStore();
  const [ollamaUrl, setOllamaUrl] = useState("");

  useEffect(() => {
    if (!settings) void loadSettings();
  }, [settings, loadSettings]);

  useEffect(() => {
    if (settings) setOllamaUrl(settings.ollama_url);
  }, [settings]);

  if (isLoading || !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading settings…</div>
      </div>
    );
  }

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
                  <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => void updateSettings({ theme: value })}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                        settings.theme === value
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
              <div className="flex items-center justify-between p-4 gap-6">
                <div className="min-w-0">
                  <Label className="text-sm text-foreground font-normal">Ollama URL</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Local AI inference server</p>
                </div>
                <Input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  onBlur={() => {
                    if (ollamaUrl !== settings.ollama_url) void updateSettings({ ollama_url: ollamaUrl });
                  }}
                  className="w-52 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <Label className="text-sm text-foreground font-normal">AI Features</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable AI-powered insights</p>
                </div>
                <button
                  onClick={() => void updateSettings({ ai_enabled: !settings.ai_enabled })}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    settings.ai_enabled ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                      settings.ai_enabled ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Planning times */}
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Schedule
            </h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              <div className="flex items-center justify-between p-4 gap-6">
                <div>
                  <Label className="text-sm text-foreground font-normal">Daily planning time</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">When to plan your day</p>
                </div>
                <Input
                  type="time"
                  value={settings.daily_planning_time}
                  onChange={(e) => void updateSettings({ daily_planning_time: e.target.value })}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between p-4 gap-6">
                <div>
                  <Label className="text-sm text-foreground font-normal">Daily review time</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">When to review your day</p>
                </div>
                <Input
                  type="time"
                  value={settings.daily_review_time}
                  onChange={(e) => void updateSettings({ daily_review_time: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          </section>

          {/* Info */}
          <div className="text-xs text-muted-foreground/40 text-center pt-2">
            LENSSTACK v0.1.0 · Offline-first · Local-only · No telemetry
          </div>
        </div>
      </div>
    </motion.div>
  );
}
