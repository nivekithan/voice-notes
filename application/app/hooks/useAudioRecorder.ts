import { useMemo, useRef, useState } from "react";
import { AudioRecorder } from "~/lib/recorder.client";

export function useAudioRecorder() {
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<null | number>(null);
  const audioRecorderRef = useRef<null | AudioRecorder>(null);
  const isRecording = intervalId !== null;

  async function startRecording() {
    if (intervalId || audioRecorderRef.current) {
      return;
    }

    const audioRecorder = new AudioRecorder();
    await audioRecorder.start();

    const newIntervalId = setInterval(() => setTimer((i) => i + 1), 1_000);
    setIntervalId(newIntervalId);
    audioRecorderRef.current = audioRecorder;
  }

  async function stopRecording() {
    const audioRecorder = audioRecorderRef.current;

    if (!audioRecorder || !intervalId) {
      return;
    }

    clearInterval(intervalId);
    const audioBlob = await audioRecorder.stop();

    setIntervalId(null);
    audioRecorderRef.current = null;

    return audioBlob;
  }

  return { timer, startRecording, stopRecording, isRecording };
}
