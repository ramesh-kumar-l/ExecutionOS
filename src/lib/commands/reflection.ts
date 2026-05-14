import { invoke } from "@tauri-apps/api/core";
import type { ReflectionEntry, ReflectionType } from "@/types";

interface CreateReflectionPayload {
  type: ReflectionType;
  content: Record<string, string>;
  mood?: number;
  energy?: number;
}

export async function getReflections(limit = 20): Promise<ReflectionEntry[]> {
  return invoke<ReflectionEntry[]>("get_reflections", { limit });
}

export async function createReflection(payload: CreateReflectionPayload): Promise<ReflectionEntry> {
  return invoke<ReflectionEntry>("create_reflection", {
    entry_type: payload.type,
    content: payload.content,
    mood: payload.mood,
    energy: payload.energy,
  });
}

export async function getReflection(id: string): Promise<ReflectionEntry> {
  return invoke<ReflectionEntry>("get_reflection", { id });
}
