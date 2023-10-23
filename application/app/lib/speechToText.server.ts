import { z } from "zod";
import { EnvVariables } from "./utils/env.server";

const AudioToTextApiSchema = z.object({
  response: z.string(),
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

  const { response } = AudioToTextApiSchema.parse(payload);

  return response;
}
