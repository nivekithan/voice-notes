import { useRef, useState } from "react";
import { AudioRecorder } from "~/lib/recorder.client";
import { LiveAudioVisualizer } from "react-audio-visualize";

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
    if (intervalId) {
      clearInterval(intervalId);
    }
    setIntervalId(null);
    setTimer(0);
  }

  function _pauseTimer() {
    clearInterval(intervalId);
    setIntervalId(null);
  }

  function _startTimer() {
    const intervalId = setInterval(() => setTimer((i) => i + 1), 1_000);
    setIntervalId(intervalId as unknown as number);
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

    _stopTimer();
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

  function Visualizer() {
    const audioRecorder = audioRecorderRef.current;
    const mediaRecorder = audioRecorder?.mediaRecorder;

    return (
      <div className="h-[30px]">
        {mediaRecorder ? (
          <LiveAudioVisualizer mediaRecorder={mediaRecorder} />
        ) : null}
      </div>
    );
  }

  return {
    timer,
    startRecording,
    stopRecording,
    recordingStatus,
    pauseRecording,
    resumeRecording,
    Visualizer,
  };
}
