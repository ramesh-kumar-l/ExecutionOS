import { invoke } from "@tauri-apps/api/core";
import type { UserSettings } from "@/types";

export async function getSettings(): Promise<UserSettings> {
  return invoke<UserSettings>("get_settings");
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  await invoke<void>("update_settings", { input: patch });
  return invoke<UserSettings>("get_settings");
}
