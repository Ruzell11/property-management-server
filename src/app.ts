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

  const repository = new InMemoryPropertyAgentRepository();
  const service = new PropertyAgentService(repository);

  app.use("/api/property-agents", propertyAgentsRouter(service));

  app.get("/", (_req, res) => {
    res.json({ message: "Property Management API is running" });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ApiError) {
      res.status(err.status).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
      },
    });
  });

  return app;
}

