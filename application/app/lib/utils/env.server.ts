import { z } from "zod";

const EnvSchema = z.object({
  HANKO_API_URL: z.string(),
  SPEECH_TO_TEXT_API: z.string(),
});

type CloudflareBindings = {
  DB: D1Database;
};

export type EnvVariables = z.infer<typeof EnvSchema> & CloudflareBindings;
