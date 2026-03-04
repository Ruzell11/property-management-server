import type { Express } from "express";
import request from "supertest";
import { createApp } from "../app.js";

describe("Property Agents API", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /health", () => {
    it("returns 200 and { ok: true }", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe("GET /api/property-agents", () => {
    it("returns empty array when no agents exist", async () => {
      const res = await request(app).get("/api/property-agents");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });

  describe("POST /api/property-agents", () => {
    it("creates an agent and returns 201 with Location header", async () => {
      const body = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        mobileNumber: "+1234567890",
      };
      const res = await request(app).post("/api/property-agents").send(body);
      expect(res.status).toBe(201);
      expect(res.headers.location).toMatch(/^\/api\/property-agents\/[a-f0-9-]+$/);
      expect(res.body).toMatchObject({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        mobileNumber: body.mobileNumber,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it("returns 400 for invalid body (missing required fields)", async () => {
      const res = await request(app)
        .post("/api/property-agents")
        .send({ firstName: "Only" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 409 when email already exists", async () => {
      const body = {
        firstName: "John",
        lastName: "Dup",
        email: "duplicate@example.com",
        mobileNumber: "+1111111111",
      };
      await request(app).post("/api/property-agents").send(body);
      const res = await request(app).post("/api/property-agents").send(body);
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });
  });

  describe("GET /api/property-agents/:id", () => {
    it("returns 200 and agent when id exists", async () => {
      const created = await request(app)
        .post("/api/property-agents")
        .send({
          firstName: "Get",
          lastName: "One",
          email: "getone@example.com",
          mobileNumber: "+2222222222",
        });
      const id = created.body.id;
      const res = await request(app).get(`/api/property-agents/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.email).toBe("getone@example.com");
    });

    it("returns 404 when id does not exist", async () => {
      const res = await request(app).get(
        "/api/property-agents/00000000-0000-0000-0000-000000000000",
      );
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PUT /api/property-agents/:id", () => {
    it("replaces agent and returns 200", async () => {
      const created = await request(app)
        .post("/api/property-agents")
        .send({
          firstName: "Put",
          lastName: "Me",
          email: "putme@example.com",
          mobileNumber: "+3333333333",
        });
      const id = created.body.id;
      const updated = await request(app)
        .put(`/api/property-agents/${id}`)
        .send({
          firstName: "Put",
          lastName: "Updated",
          email: "putme.updated@example.com",
          mobileNumber: "+3333333334",
        });
      expect(updated.status).toBe(200);
      expect(updated.body.lastName).toBe("Updated");
      expect(updated.body.email).toBe("putme.updated@example.com");
      expect(updated.body.updatedAt).not.toBe(created.body.updatedAt);
    });

    it("returns 404 when id does not exist", async () => {
      const res = await request(app)
        .put("/api/property-agents/00000000-0000-0000-0000-000000000000")
        .send({
          firstName: "A",
          lastName: "B",
          email: "ab@example.com",
          mobileNumber: "+4444444444",
        });
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/property-agents/:id", () => {
    it("patches agent and returns 200", async () => {
      const created = await request(app)
        .post("/api/property-agents")
        .send({
          firstName: "Patch",
          lastName: "Me",
          email: "patchme@example.com",
          mobileNumber: "+5555555555",
        });
      const id = created.body.id;
      const res = await request(app)
        .patch(`/api/property-agents/${id}`)
        .send({ mobileNumber: "+5555555556" });
      expect(res.status).toBe(200);
      expect(res.body.mobileNumber).toBe("+5555555556");
      expect(res.body.firstName).toBe("Patch");
    });

    it("returns 404 when id does not exist", async () => {
      const res = await request(app)
        .patch("/api/property-agents/00000000-0000-0000-0000-000000000000")
        .send({ firstName: "X" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/property-agents/:id", () => {
    it("deletes agent and returns 204", async () => {
      const created = await request(app)
        .post("/api/property-agents")
        .send({
          firstName: "Delete",
          lastName: "Me",
          email: "deleteme@example.com",
          mobileNumber: "+6666666666",
        });
      const id = created.body.id;
      const res = await request(app).delete(`/api/property-agents/${id}`);
      expect(res.status).toBe(204);
      const getRes = await request(app).get(`/api/property-agents/${id}`);
      expect(getRes.status).toBe(404);
    });

    it("returns 404 when id does not exist", async () => {
      const res = await request(app).delete(
        "/api/property-agents/00000000-0000-0000-0000-000000000000",
      );
      expect(res.status).toBe(404);
    });
  });
});
