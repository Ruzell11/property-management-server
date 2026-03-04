import type { PropertyAgent, PropertyAgentCore } from "../store/propertyAgent.js";

export interface PropertyAgentRepository {
  list(): PropertyAgent[];
  getById(id: string): PropertyAgent | undefined;
  create(core: PropertyAgentCore): PropertyAgent;
  replace(id: string, core: PropertyAgentCore): PropertyAgent | undefined;
  patch(id: string, patch: Partial<PropertyAgentCore>): PropertyAgent | undefined;
  delete(id: string): boolean;
  existsByEmail(email: string, excludeId?: string): boolean;
}
