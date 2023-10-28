import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";

export type RecorderProps = {
  isRecording: boolean;
  timer: number;
  onMicClick: () => void;
  Visualizer: () => React.ReactNode;
};

export function Recorder({
  isRecording,
  onMicClick,
  timer,
  Visualizer,
}: RecorderProps) {
  return (
    <div className="grid place-items-center h-[260px]">
      <div className="flex flex-col gap-y-6 items-center">
        <p className="text-center text-3xl font-semibold leading-none tracking-tight">
          {timer}
        </p>
        <Button
          variant={isRecording ? "default" : "outline"}
          type="button"
          className="rounded-full h-12 w-12"
          onClick={onMicClick}
        >
          {isRecording ? (
            <Mic width="48" height="48" />
          ) : (
            <MicOff width="48" height="48" />
          )}
        </Button>

        {isRecording ? <Visualizer /> : null}
      </div>
    </div>
  );
}
