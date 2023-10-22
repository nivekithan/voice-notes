import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { convertAudioToText } from "~/lib/speechToText.server";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;

  await requireUser(request, env);

  const audio = await request.arrayBuffer();
  const audioInText = await convertAudioToText({ audio });

  return json(audioInText);
}

export async function convertAudioToTextClient({
  audio,
}: {
  audio: ArrayBuffer;
}) {
  const url = "http://localhost:8788/resources/audioToText";
  // const audioContext = new AudioContext();
  // const audioBuffer = await audioContext.decodeAudioData(audio);
  // const wavAudio = toWav(audioBuffer);

  const res = await fetch(url, {
    body: audio,
    method: "POST",
  });
  const payload = (await res.json()) as string;

  return payload;
}
