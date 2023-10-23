import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useState } from "react";
import { useAudioRecorder } from "~/hooks/useAudioRecorder";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { convertAudioToTextClient } from "./resources.audioToText";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;

  await requireUser(request, env);

  return null;
}

export default function Component() {
  const {
    startRecording,
    stopRecording,
    timer,
    recordingStatus,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const [transcription, setTranscription] = useState("");

  async function onToggleTimer() {
    if (recordingStatus === "RECORDING" || recordingStatus === "PAUSED") {
      const audioBlob = await stopRecording();
      const audioBuffer = await audioBlob.arrayBuffer();
      const transcription = await convertAudioToTextClient({
        audio: audioBuffer,
      });

      setTranscription(transcription);

      return;
    }

    return startRecording();
  }

  async function onPauseTimer() {
    if (recordingStatus === "RECORDING") {
      await pauseRecording();
    } else if (recordingStatus === "PAUSED") {
      await resumeRecording();
    }
  }

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="p-10">
        <p className="text-4xl font-semibold">{timer}</p>
        <button
          className="px-3 py-2 bg-purple-600"
          type="button"
          onClick={onToggleTimer}
        >
          {recordingStatus === "RECORDING" || recordingStatus === "PAUSED"
            ? "Finish"
            : "Start"}
        </button>
        {recordingStatus === "RECORDING" || recordingStatus === "PAUSED" ? (
          <button
            className="px-3 py-2 bg-purple-600"
            type="button"
            onClick={onPauseTimer}
          >
            {recordingStatus === "PAUSED" ? "Resume" : "Pause"}
          </button>
        ) : null}
      </div>
      <p>{transcription}</p>
    </main>
  );
}
