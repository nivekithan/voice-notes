import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { useState } from "react";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { convertAudioToTextClient } from "./resources.audioToText";

export const meta: MetaFunction = () => {
  return [
    { title: "Voice notes" },
    {
      name: "description",
      content: "Convert your voice notes to cleary written notes",
    },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;
  await requireUser(request, env);

  return json(null);
}
type RecordingStatus = "RECORDING" | "NOT_RECORDING" | "CONVERTING_TO_TEXT";

export default function Index() {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("NOT_RECORDING");

  const [transcript, setTranscript] = useState<string | null>(null);

  async function onRecordAudio() {
    console.log("Before Media Devices");
    const mediaDevices = navigator.mediaDevices;
    console.log("Before getUserMedia");
    const mediaStream = await mediaDevices.getUserMedia({
      audio: true,
      preferCurrentTab: false,
      video: false,
    });
    console.log("After getUserMedia");
    const mediaRecorder = new MediaRecorder(mediaStream, {});

    console.log("After Media Recorder");

    const mediaBlobs: Blob[] = [];

    mediaRecorder.addEventListener("dataavailable", (e) => {
      mediaBlobs.push(e.data);
    });

    mediaRecorder.start();

    setRecordingStatus("RECORDING");

    setTimeout(() => mediaRecorder.stop(), 1_000);

    mediaRecorder.addEventListener("stop", async () => {
      try {
        const mimeType = mediaRecorder.mimeType;
        console.log(mimeType);
        console.log(mediaBlobs.length);
        const audioBlob = new Blob(mediaBlobs, { type: mimeType });
        const audio = await audioBlob.arrayBuffer();
        setRecordingStatus("CONVERTING_TO_TEXT");

        const text = await convertAudioToTextClient({ audio });

        setRecordingStatus("NOT_RECORDING");
        setTranscript(text);
      } catch (err) {
        setRecordingStatus("NOT_RECORDING");
      }
    });
  }

  return (
    <main className="grid min-h-screen place-items-center">
      <button
        type="button"
        className="px-3 py-2 rounded-md bg-blue-700 border border-blue-700 text-white"
        onClick={onRecordAudio}
      >
        {recordingStatus}
      </button>
      {transcript ? <p>{transcript}</p> : null}
    </main>
  );
}
