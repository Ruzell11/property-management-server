import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { ApiError } from "./lib/errors.js";
import { propertyAgentsRouter } from "./routes/propertyAgents.js";
import { InMemoryPropertyAgentRepository } from "./repositories/inMemoryPropertyAgentRepository.js";
import { PropertyAgentService } from "./service/propertyAgentService.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get("/health", (_req, res) => res.json({ ok: true }));


  app.get("/", (_req, res) => {
    res.json({ message: "Property Management API is running" });
  });


  return app;
}

