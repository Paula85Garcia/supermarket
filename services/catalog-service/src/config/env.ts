import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  PORT: z.coerce.number().int().positive().default(3002),
  JWT_PUBLIC_KEY: z.string().min(1),
  KAFKA_BROKERS: z.string().min(1),
  KAFKA_GROUP_ID: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  ELASTICSEARCH_URL: z.string().url(),
  ELASTICSEARCH_INDEX: z.string().min(1),
  REDIS_URL: z.string().min(1)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const env = parsed.data;
