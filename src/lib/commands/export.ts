import { invoke } from "@tauri-apps/api/core";

export interface ExportInput {
  format: "markdown" | "json" | "csv" | "encrypted";
  scope: "full" | "goals" | "reflections" | "execution" | "knowledge";
  output_path: string;
  password?: string;
}

export async function exportData(input: ExportInput): Promise<void> {
  return invoke<void>("export_data", input);
}
