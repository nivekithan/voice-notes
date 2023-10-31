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
    <div className="grid place-items-center h-[280px]">
      <div className="flex flex-col gap-y-6 items-center">
        <p className="text-center text-4xl font-semibold leading-none tracking-tight text-cyan-400">
          {timer}
        </p>
        <Button
          variant={isRecording ? "default" : "outline"}
          type="button"
          className={`rounded-full h-12 w-12 ${
            isRecording
              ? "bg-purple-800 hover:bg-purple-900 text-white border-primary border-2"
              : ""
          }`}
          size="icon"
          onClick={onMicClick}
        >
          {isRecording ? <Mic size="20px" /> : <MicOff size="20px" />}
        </Button>

        {isRecording ? <Visualizer /> : null}
      </div>
    </div>
  );
}
