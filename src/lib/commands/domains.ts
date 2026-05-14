import { invoke } from "@tauri-apps/api/core";
import type { Domain } from "@/types";

export async function getDomains(): Promise<Domain[]> {
  return invoke<Domain[]>("get_domains");
}

export async function getDomain(id: string): Promise<Domain> {
  return invoke<Domain>("get_domain", { id });
}

export async function updateDomain(
  id: string,
  patch: Partial<Pick<Domain, "vision" | "purpose" | "current_status" | "sort_order">>
): Promise<Domain> {
  return invoke<Domain>("update_domain", { id, ...patch });
}

export async function getDomainHealth(id: string): Promise<number> {
  return invoke<number>("get_domain_health", { id });
}
