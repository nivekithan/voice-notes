import { useRef, useState } from "react";
import { AudioRecorder } from "~/lib/recorder.client";

export function useAudioRecorder() {
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<null | number>(null);
  const audioRecorderRef = useRef<null | AudioRecorder>(null);
  const recordingStatus = (() => {
    console.log({ intervalId, audioRecorder: audioRecorderRef.current });
    if (intervalId && audioRecorderRef.current) {
      return "RECORDING" as const;
    } else if (!intervalId && audioRecorderRef.current) {
      return "PAUSED" as const;
    } else {
      return "STOPPED" as const;
    }
  })();

  function _stopTimer() {
    clearInterval(intervalId);
    setIntervalId(null);
    setTimer(0);
  }

  function _pauseTimer() {
    clearInterval(intervalId);
    setIntervalId(null);
  }

  function _startTimer() {
    const intervalId = setInterval(() => setTimer((i) => i + 1), 1_000);
    setIntervalId(intervalId);
  }

  async function startRecording() {
    if (intervalId || audioRecorderRef.current) {
      return;
    }

    const audioRecorder = new AudioRecorder();
    await audioRecorder.start();

    _startTimer();
    audioRecorderRef.current = audioRecorder;
  }

  async function stopRecording() {
    const audioRecorder = audioRecorderRef.current;

    if (!audioRecorder) {
      throw new Error(`Recorder has not been started`);
    }

    const audioBlob = await audioRecorder.stop();
    audioRecorderRef.current = null;

    if (intervalId) {
      _stopTimer();
    } else {
      setTimer(0);
    }
    return audioBlob;
  }

  async function pauseRecording() {
    const audioRecorder = audioRecorderRef.current;

    if (!audioRecorder || !intervalId) {
      throw new Error(`Recorder has not been started`);
    }

    _pauseTimer();
    return audioRecorder.pause();
  }

  async function resumeRecording() {
    const audioRecorder = audioRecorderRef.current;

    if (!audioRecorder || intervalId) {
      throw new Error(`Recorder has not been started`);
    }

    audioRecorder.resume();
    _startTimer();
  }

  return {
    timer,
    startRecording,
    stopRecording,
    recordingStatus,
    pauseRecording,
    resumeRecording,
  };
}
