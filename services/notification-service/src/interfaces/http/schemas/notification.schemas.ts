import { z } from "zod";

export const healthcheckSchema = z.object({
  ok: z.boolean()
});
