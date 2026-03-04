import { Router } from "express";
import { ZodError } from "zod";
import {
  PropertyAgentCreateSchema,
  PropertyAgentPatchSchema,
  PropertyAgentReplaceSchema,
} from "../store/propertyAgent.js";
import { ApiError, zodDetails } from "../lib/errors.js";
import type { PropertyAgentService } from "../service/propertyAgentService.js";

export function propertyAgentsRouter(service: PropertyAgentService) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(service.list());
  });

  router.post("/", (req, res) => {
    try {
      const core = PropertyAgentCreateSchema.parse(req.body);
      const created = service.create(core);
      res.status(201).setHeader("Location", `/api/property-agents/${created.id}`).json(created);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError({
          code: "VALIDATION_ERROR",
          status: 400,
          message: "Invalid request body.",
          details: zodDetails(err),
        });
      }
      throw err;
    }
  });

  router.get("/:id", (req, res) => {
    res.json(service.getById(req.params.id));
  });

  router.put("/:id", (req, res) => {
    try {
      const core = PropertyAgentReplaceSchema.parse(req.body);
      const updated = service.replace(req.params.id, core);
      res.json(updated);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError({
          code: "VALIDATION_ERROR",
          status: 400,
          message: "Invalid request body.",
          details: zodDetails(err),
        });
      }
      throw err;
    }
  });

  router.patch("/:id", (req, res) => {
    try {
      const patch = PropertyAgentPatchSchema.parse(req.body);
      const updated = service.patch(req.params.id, patch);
      res.json(updated);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError({
          code: "VALIDATION_ERROR",
          status: 400,
          message: "Invalid request body.",
          details: zodDetails(err),
        });
      }
      throw err;
    }
  });

  router.delete("/:id", (req, res) => {
    service.delete(req.params.id);
    res.status(204).send();
  });

  return router;
}

