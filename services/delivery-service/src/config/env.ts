import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  PORT: z.coerce.number().int().positive().default(3007),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  KAFKA_BROKERS: z.string().min(1),
  KAFKA_GROUP_ID: z.string().min(1),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  GPS_UPDATE_INTERVAL_SECONDS: z.coerce.number().int().positive().default(10),
  ETA_BUFFER_PERCENTAGE: z.coerce.number().int().positive().default(15)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment: ${parsed.error.message}`);

export const env = parsed.data;
