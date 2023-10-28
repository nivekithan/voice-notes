import { z } from "zod";
import { EnvVariables } from "./utils/env.server";

const AudioToTextCreateNoteSchema = z.object({
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

  return AudioToTextCreateNoteSchema.parse(payload);
}

const AudioToTextUpdateNoteSchema = z.object({ content: z.string() });

export async function updateTextWithAudio({
  audio,
  currentText,
  env,
  systemMessage,
}: {
  audio: File;
  systemMessage: string;
  env: EnvVariables;
  currentText: string;
}) {
  const formData = new FormData();

  formData.set("audio", audio);
  formData.set("systemMessage", systemMessage);
  formData.set("currentText", currentText);

  const res = await fetch(env.SPEECH_TO_TEXT_API, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json();

  return AudioToTextUpdateNoteSchema.parse(payload);
}
