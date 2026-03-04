import type { PropertyAgent, PropertyAgentCore } from "../store/propertyAgent.js";
import type { PropertyAgentRepository } from "./propertyAgentRepository.js";

function nowIso() {
  return new Date().toISOString();
}

export class InMemoryPropertyAgentRepository implements PropertyAgentRepository {
  private readonly byId = new Map<string, PropertyAgent>();

  list(): PropertyAgent[] {
    return [...this.byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getById(id: string): PropertyAgent | undefined {
    return this.byId.get(id);
  }

  existsByEmail(email: string, excludeId?: string): boolean {
    const normalized = email.trim().toLowerCase();
    for (const a of this.byId.values()) {
      if (excludeId && a.id === excludeId) continue;
      if (a.email === normalized) return true;
    }
    return false;
  }

  create(core: PropertyAgentCore): PropertyAgent {
    const id = crypto.randomUUID();
    const ts = nowIso();
    const agent: PropertyAgent = {
      id,
      ...core,
      email: core.email.trim().toLowerCase(),
      createdAt: ts,
      updatedAt: ts,
    };
    this.byId.set(id, agent);
    return agent;
  }

  replace(id: string, core: PropertyAgentCore): PropertyAgent | undefined {
    const existing = this.byId.get(id);
    if (!existing) return undefined;
    const ts = nowIso();
    const updated: PropertyAgent = {
      id,
      ...core,
      email: core.email.trim().toLowerCase(),
      createdAt: existing.createdAt,
      updatedAt: ts,
    };
    this.byId.set(id, updated);
    return updated;
  }

  patch(id: string, patch: Partial<PropertyAgentCore>): PropertyAgent | undefined {
    const existing = this.byId.get(id);
    if (!existing) return undefined;
    const ts = nowIso();
    const updated: PropertyAgent = {
      ...existing,
      ...patch,
      email: patch.email ? patch.email.trim().toLowerCase() : existing.email,
      updatedAt: ts,
    };
    this.byId.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.byId.delete(id);
  }
}
