import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useAudioRecorder } from "~/hooks/useAudioRecorder";
import { useEffect, useState } from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { convertAudioToText } from "~/lib/speechToText.server";
import { drizzle } from "drizzle-orm/d1";
import { createNewNotes, getAllNotes } from "~/models/notes";
import { ClipLoader } from "react-spinners";
import {
  addInstructionAboutTitle,
  findPrompt,
  getWhitelistedPrompts,
} from "~/lib/prompt";
import { Recorder } from "~/components/recorder";
import { Mic, Settings } from "lucide-react";
import { getSpellingMistake } from "~/models/spellingMistake";
import { AllNotesPreview } from "./notePreview";
import { ScrollArea } from "~/components/ui/scroll-area";

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
  const userId = await requireUser(request, env);

  const db = drizzle(env.DB);

  const [allNotes, prompts] = await Promise.all([
    getAllNotes({ db, userId }),
    getWhitelistedPrompts({ db, userId }),
  ]);

  return json({ prompts: prompts, notes: allNotes });
}

export type HomeLoader = typeof loader;

export type HomeAction = typeof action;

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const formData = await request.formData();

  const audio = formData.get("audio");
  const promptId = formData.get("promptId");

  if (!(audio instanceof File)) {
    throw new Response("Expected audio to be file", { status: 400 });
  }

  if (!promptId || typeof promptId !== "string") {
    throw new Response("Expected promptId to be string", { status: 400 });
  }

  const prompt = await findPrompt({ db, promptId, userId });

  if (!prompt) {
    throw new Response("invalid promptId");
  }

  const spellingMistake = await getSpellingMistake({ db, userId });

  const systemMessage =
    prompt.type === "included"
      ? prompt.systemMessage
      : addInstructionAboutTitle(prompt.systemMessage);

  const { content, title, transcript } = await convertAudioToText({
    audio,
    env,
    systemMessage: systemMessage,
    spellingMistake: spellingMistake?.spellingMistake || "",
  });

  const notes = await createNewNotes({
    db,
    content,
    title,
    transcript,
    status: "DONE",
    userId,
    promptId,
  });

  return json(notes);
}

type FlowState = "RECORDING" | "STYLES";

export default function Index() {
  const { prompts } = useLoaderData<typeof loader>();
  const {
    pauseRecording,
    recordingStatus,
    resumeRecording,
    startRecording,
    stopRecording,
    timer,
    Visualizer,
  } = useAudioRecorder();

  const fetcher = useFetcher<typeof action>();

  const [flowState, setFlowState] = useState<FlowState>("RECORDING");
  const [promtStyleId, setPromptStyleId] = useState<string>(prompts[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isRecording = recordingStatus === "RECORDING";
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  async function onMicClick() {
    if (recordingStatus === "STOPPED") {
      await startRecording();
    } else if (recordingStatus === "PAUSED") {
      await resumeRecording();
    } else if (recordingStatus === "RECORDING") {
      await pauseRecording();
    }
  }

  async function onDialogStateChange(newState: boolean) {
    if (isRecording || isLoading) {
      return;
    }

    if (!newState) {
      stopRecording().catch(() => {
        // Ignore the error Since there is a  chance the recording has never
        // been started
      });
      setFlowState("RECORDING");
      setPromptStyleId(prompts[0].id);
    } else {
      await startRecording();
    }

    setIsDialogOpen(newState);
  }

  function onChooseStyles() {
    setFlowState("STYLES");
  }

  async function onCreateNewNote() {
    // Show loading indicator
    console.log("Running onCreateNewNote");
    const promptId = promtStyleId;
    const audioBlob = await stopRecording();

    const formData = new FormData();
    const audioFile = new File([audioBlob], "audio.webm", {
      type: "audio/webm",
    });

    formData.set("promptId", promptId);
    formData.set("audio", audioFile);

    fetcher.submit(formData, {
      encType: "multipart/form-data",
      method: "post",
    });
  }

  useEffect(() => {
    if (fetcher.state === "idle") {
      onDialogStateChange(false);
    }
  }, [fetcher.state]);

  return (
    <div className="container py-4">
      <main className="flex flex-col gap-y-10 ">
        <div className="flex items-center justify-center gap-x-2">
          <h1 className="text-4xl font-bold font-['Merriweather'] tracking-wide">
            Notes
          </h1>
          <Link
            to="/setting"
            prefetch="intent"
            className="w-10 h-10"
            unstable_viewTransition
          >
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <Settings width={22} height={22} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 auto-rows-max">
          <AllNotesPreview />
        </div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={onDialogStateChange}>
            <div className="fixed bottom-0 left-0 right-0 flex justify-center py-8">
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-purple-800 text-white hover:bg-purple-900 border-2 border-primary"
                >
                  <Mic size="24" />
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogHeader[flowState]}</DialogTitle>
                <DialogDescription>
                  {dialogDescription[flowState]}
                </DialogDescription>
              </DialogHeader>
              {flowState === "RECORDING" ? (
                <Recorder
                  isRecording={isRecording}
                  onMicClick={onMicClick}
                  timer={timer}
                  Visualizer={Visualizer}
                />
              ) : (
                <div className="flex flex-col gap-y-4">
                  {prompts.map((value) => (
                    <button
                      type="button"
                      className={`flex flex-col space-y-1.5 text-center sm:text-left border p-4 rounded-sm ${
                        promtStyleId === value.id ? "border-primary" : ""
                      }`}
                      onClick={() => {
                        setPromptStyleId(value.id);
                      }}
                      autoFocus={false}
                    >
                      <h3 className="text-lg font-semibold leading-none tracking-tight text-cyan-400">
                        {value.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button
                  disabled={
                    flowState === "RECORDING"
                      ? recordingStatus !== "PAUSED"
                      : promtStyleId === null
                  }
                  type="button"
                  onClick={
                    flowState === "RECORDING" ? onChooseStyles : onCreateNewNote
                  }
                  className="flex gap-x-2 bg-purple-800 hover:bg-purple-900 text-white border-2 border-primary"
                >
                  {finishFlow[flowState]}
                  {isLoading ? (
                    <ClipLoader size="16px" color="hsl(210,40%,98%)" />
                  ) : null}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

type FlowBasedText = Record<FlowState, string>;

const dialogHeader: FlowBasedText = {
  RECORDING: "Create new voice note",
  STYLES: "Choose style",
};

const dialogDescription: FlowBasedText = {
  RECORDING: "Hit record and let the ideas flow",
  STYLES: "Don't worry about choosing correct style. You can change it later",
};

const finishFlow: FlowBasedText = {
  RECORDING: "Choose styles",
  STYLES: "Create new note",
};
