import { invoke } from "@tauri-apps/api/core";
import type { KnowledgeNote, NoteType } from "@/types";

export interface CreateNoteInput {
  note_type: NoteType;
  title: string;
  content: string;
  tags: string[];
  domain_id?: string;
  goal_id?: string;
  source?: string;
}

export async function getKnowledgeNotes(params?: {
  search?: string;
  note_type?: NoteType;
  domain_id?: string;
  limit?: number;
}): Promise<KnowledgeNote[]> {
  return invoke<KnowledgeNote[]>("get_knowledge_notes", {
    search: params?.search,
    note_type: params?.note_type,
    domain_id: params?.domain_id,
    limit: params?.limit ?? 50,
  });
}

export async function createKnowledgeNote(input: CreateNoteInput): Promise<KnowledgeNote> {
  return invoke<KnowledgeNote>("create_knowledge_note", {
    note_type: input.note_type,
    title: input.title,
    content: input.content,
    tags: input.tags,
    domain_id: input.domain_id,
    goal_id: input.goal_id,
    source: input.source,
  });
}

export async function updateKnowledgeNote(
  id: string,
  patch: { title?: string; content?: string; tags?: string[]; source?: string }
): Promise<KnowledgeNote> {
  return invoke<KnowledgeNote>("update_knowledge_note", { id, ...patch });
}

export async function deleteKnowledgeNote(id: string): Promise<void> {
  return invoke<void>("delete_knowledge_note", { id });
}
