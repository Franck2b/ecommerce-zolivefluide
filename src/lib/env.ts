import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  APP_URL: z.url().default("http://localhost:3000"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional().or(z.literal("").transform(() => undefined)),
  STRIPE_WEBHOOK_SECRET: z.string().optional().or(z.literal("").transform(() => undefined)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = schema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";
