import { z } from "zod";

const EnvSchema = z.object({ HANKO_API_URL: z.string() });

export type EnvVariables = z.infer<typeof EnvSchema>;
