import { z } from "zod";

/**
 * Set speech to text api url in environment variable
 */
const pageUrl = "http://localhost:8787";

const AudioToTextApiSchema = z.object({
  response: z.object({ text: z.string() }),
});

export async function convertAudioToText({ audio }: { audio: ArrayBuffer }) {
  const res = await fetch(pageUrl, {
    method: "POST",
    body: audio,
  });
  const payload = await res.json();

  const { response } = AudioToTextApiSchema.parse(payload);

  return response.text;
}