import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./infrastructure/database/mongoose.js";

const start = async (): Promise<void> => {
  await connectMongo();
  const app = buildApp();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
};

start();
