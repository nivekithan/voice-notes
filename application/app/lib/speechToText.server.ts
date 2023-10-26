import { z } from "zod";
import { EnvVariables } from "./utils/env.server";

const AudioToTextApiSchema = z.object({
  transcript: z.string(),
  title: z.string(),
  content: z.string(),
});

export async function convertAudioToText({
  audio,
  env,
}: {
  audio: ArrayBuffer;
  env: EnvVariables;
}) {
  const res = await fetch(env.SPEECH_TO_TEXT_API, {
    method: "POST",
    body: audio,
  });

  const payload = await res.json();

  console.log({ payload });

  return AudioToTextApiSchema.parse(payload);
}
