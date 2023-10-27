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
  systemMessage,
}: {
  audio: File;
  systemMessage: string;
  env: EnvVariables;
}) {
  const formData = new FormData();

  formData.set("audio", audio);
  formData.set("systemMessage", systemMessage);

  const res = await fetch(env.SPEECH_TO_TEXT_API, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json();

  console.log({ payload });

  return AudioToTextApiSchema.parse(payload);
}
