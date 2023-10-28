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
  spellingMistake,
}: {
  audio: File;
  systemMessage: string;
  env: EnvVariables;
  spellingMistake: string;
}) {
  const formData = new FormData();

  const newSystemMessage = `${systemMessage}\n While correcting spelling mistake makes sure all these words are spelled correct: ${spellingMistake}`;

  formData.set("audio", audio);
  formData.set("systemMessage", newSystemMessage);

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
  spellingMistake,
}: {
  audio: File;
  systemMessage: string;
  env: EnvVariables;
  currentText: string;
  spellingMistake: string;
}) {
  const formData = new FormData();

  const newSystemMessage = `${systemMessage}\n While correcting spelling mistake makes sure all these words are spelled correct: ${spellingMistake}`;
  formData.set("audio", audio);
  formData.set("systemMessage", newSystemMessage);
  formData.set("currentText", currentText);

  const res = await fetch(env.SPEECH_TO_TEXT_API, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json();

  return AudioToTextUpdateNoteSchema.parse(payload);
}
