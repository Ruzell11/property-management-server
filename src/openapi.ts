export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Property Management API",
    description: "REST API for Property Agent CRUD operations",
    version: "1.0.0",
  },
  servers: [{ url: "/", description: "Current host" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { type: "object", properties: { ok: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/api/property-agents": {
      get: {
        summary: "List all property agents",
        tags: ["Property Agents"],
        responses: {
          "200": {
            description: "List of property agents",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PropertyAgent" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a property agent",
        tags: ["Property Agents"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PropertyAgentCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            headers: {
              Location: {
                schema: { type: "string", example: "/api/property-agents/{id}" },
                description: "URL of the created resource",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PropertyAgent" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/property-agents/{id}": {
      get: {
        summary: "Get a property agent by ID",
        tags: ["Property Agents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Property agent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PropertyAgent" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        summary: "Replace a property agent",
        tags: ["Property Agents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PropertyAgentCreate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated property agent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PropertyAgent" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
      patch: {
        summary: "Partially update a property agent",
        tags: ["Property Agents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PropertyAgentPatch" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated property agent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PropertyAgent" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
      delete: {
        summary: "Delete a property agent",
        tags: ["Property Agents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": { description: "No content" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    schemas: {
      PropertyAgent: {
        type: "object",
        required: ["id", "firstName", "lastName", "email", "mobileNumber", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string", minLength: 1, maxLength: 100 },
          lastName: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email", maxLength: 320 },
          mobileNumber: { type: "string", minLength: 5, maxLength: 30 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PropertyAgentCreate: {
        type: "object",
        required: ["firstName", "lastName", "email", "mobileNumber"],
        properties: {
          firstName: { type: "string", minLength: 1, maxLength: 100 },
          lastName: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email", maxLength: 320 },
          mobileNumber: { type: "string", minLength: 5, maxLength: 30 },
        },
      },
      PropertyAgentPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          firstName: { type: "string", minLength: 1, maxLength: 100 },
          lastName: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email", maxLength: 320 },
          mobileNumber: { type: "string", minLength: 5, maxLength: 30 },
        },
      },
      ApiError: {
        type: "object",
        description: "All error responses use this shape. Frontend can switch on error.code for concrete UI.",
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: ["VALIDATION_ERROR", "NOT_FOUND", "CONFLICT", "INTERNAL_ERROR"],
                description: "Use this to show concrete errors: validation fields, not found, duplicate email, generic.",
              },
              message: { type: "string", description: "Human-readable message from the server." },
              details: {
                type: "array",
                description: "When code is VALIDATION_ERROR, array of { path, message } for field-level errors.",
                items: { $ref: "#/components/schemas/ValidationErrorDetail" },
              },
            },
          },
        },
      },
      ValidationErrorDetail: {
        type: "object",
        properties: {
          path: { type: "string", description: "Field path, e.g. 'email' or 'firstName'" },
          message: { type: "string", description: "Validation message for this field" },
        },
      },
    },
    responses: {
      ValidationError: {
        description: "Invalid request body",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Conflict: {
        description: "Conflict (e.g. duplicate email)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
    },
  },
} as const;
