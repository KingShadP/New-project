import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  KSP_ADMIN_PASSWORD: z.string().optional(),
  KSP_ADMIN_SECRET: z.string().optional(),
  KSP_BREAK_GLASS_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const env = parsed;

export function isProduction() {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}
