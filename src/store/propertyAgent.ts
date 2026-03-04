import { z } from "zod";

export const PropertyAgentId = z.string().min(1);

export const PropertyAgentBaseSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(320),
  mobileNumber: z.string().trim().min(5).max(30),
});

export const PropertyAgentCreateSchema = PropertyAgentBaseSchema;
export const PropertyAgentReplaceSchema = PropertyAgentBaseSchema;
export const PropertyAgentPatchSchema = PropertyAgentBaseSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "At least one field must be provided." },
);

export type PropertyAgentCore = z.infer<typeof PropertyAgentBaseSchema>;

export type PropertyAgent = PropertyAgentCore & {
  id: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
};
