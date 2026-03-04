import type { PropertyAgent, PropertyAgentCore } from "../store/propertyAgent.js";
import { API_ERROR_CODES, ApiError } from "../lib/errors.js";
import type { PropertyAgentRepository } from "../repositories/propertyAgentRepository.js";

export class PropertyAgentService {
  constructor(private readonly repository: PropertyAgentRepository) {}

  list(): PropertyAgent[] {
    return this.repository.list();
  }

  getById(id: string): PropertyAgent {
    const agent = this.repository.getById(id);
    if (!agent) {
      throw new ApiError({ code: API_ERROR_CODES.NOT_FOUND, status: 404, message: "Property agent not found." });
    }
    return agent;
  }

  create(core: PropertyAgentCore): PropertyAgent {
    if (this.repository.existsByEmail(core.email)) {
      throw new ApiError({
        code: API_ERROR_CODES.CONFLICT,
        status: 409,
        message: "A property agent with this email already exists.",
      });
    }
    return this.repository.create(core);
  }

  replace(id: string, core: PropertyAgentCore): PropertyAgent {
    if (this.repository.existsByEmail(core.email, id)) {
      throw new ApiError({
        code: API_ERROR_CODES.CONFLICT,
        status: 409,
        message: "A property agent with this email already exists.",
      });
    }
    const updated = this.repository.replace(id, core);
    if (!updated) {
      throw new ApiError({ code: "NOT_FOUND", status: 404, message: "Property agent not found." });
    }
    return updated;
  }

  patch(id: string, patch: Partial<PropertyAgentCore>): PropertyAgent {
    if (patch.email && this.repository.existsByEmail(patch.email, id)) {
      throw new ApiError({
        code: API_ERROR_CODES.CONFLICT,
        status: 409,
        message: "A property agent with this email already exists.",
      });
    }
    const updated = this.repository.patch(id, patch);
    if (!updated) {
      throw new ApiError({ code: API_ERROR_CODES.NOT_FOUND, status: 404, message: "Property agent not found." });
    }
    return updated;
  }

  delete(id: string): void {
    const ok = this.repository.delete(id);
    if (!ok) {
      throw new ApiError({ code: API_ERROR_CODES.NOT_FOUND, status: 404, message: "Property agent not found." });
    }
  }
}

