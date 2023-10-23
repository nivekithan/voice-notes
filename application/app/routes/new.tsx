import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useAudioRecorder } from "~/hooks/useAudioRecorder";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;

  await requireUser(request, env);

  return null;
}

export default function Component() {
  const { startRecording, stopRecording, timer, isRecording } =
    useAudioRecorder();

  async function onToggleTimer() {
    if (isRecording) {
      const audioBlob = await stopRecording();
      console.log(`audioBlob is blob: ${audioBlob instanceof Blob}`);
      return;
    }

    return startRecording();
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
          Start
        </button>
        <button
          className="px-3 py-2 bg-purple-600"
          type="button"
          onClick={onToggleTimer}
        >
          Stop
        </button>
      </div>
    </main>
  );
}
