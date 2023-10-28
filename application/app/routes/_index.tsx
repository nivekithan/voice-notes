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
import { Mic, MicOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { convertAudioToText } from "~/lib/speechToText.server";
import { drizzle } from "drizzle-orm/d1";
import { createNewNotes, getAllNotes } from "~/models/notes";
import { ClipLoader } from "react-spinners";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { findPrompt, getWhitelistedPrompts } from "~/lib/prompt";
import { Recorder } from "~/components/recorder";

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
  const allNotes = await getAllNotes({ db, userId });
  const prompts = getWhitelistedPrompts();

  return json({ prompts: prompts, notes: allNotes });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);

  const formData = await request.formData();

  const audio = formData.get("audio");
  const promptId = formData.get("promptId");

  if (!(audio instanceof File)) {
    throw new Response("Expected audio to be file", { status: 400 });
  }

  if (!promptId || typeof promptId !== "string") {
    throw new Response("Expected promptId to be string", { status: 400 });
  }

  const prompt = findPrompt(promptId);

  if (!prompt) {
    throw new Response("invalid promptId");
  }

  const db = drizzle(env.DB);

  const { content, title, transcript } = await convertAudioToText({
    audio,
    env,
    systemMessage: prompt.systemMessage,
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

  console.log(notes);

  return json(notes);
}

type FlowState = "RECORDING" | "STYLES";

export default function Index() {
  const { prompts, notes } = useLoaderData<typeof loader>();
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
    if (isRecording) {
      await pauseRecording();
      return;
    }

    if (recordingStatus === "PAUSED") {
      await resumeRecording();
    } else {
      await startRecording();
    }
  }

  function onDialogStateChange(newState: boolean) {
    setIsDialogOpen(newState);
    if (newState === false) {
      stopRecording().catch(() => {
        // Ignore the error Since there is a  chance the recording has never
        // been started
      });
    }

    setFlowState("RECORDING");
    setPromptStyleId(prompts[0].id);
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
      setIsDialogOpen(false);
    }
  }, [fetcher.state]);

  return (
    <main className="flex flex-col gap-y-10">
      <h1 className="text-center text-4xl font-bold">Notes</h1>
      <div className="grid grid-cols-4 gap-4 auto-rows-max">
        {notes.map((note) => {
          return (
            <Link to={`/notes/${note.id}`} key={note.id}>
              <Card className="hover:border-primary min-h-[150px]">
                <CardHeader>
                  <CardTitle className="leading-8 line-clamp-2">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 leading-6">
                    {note.content}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
      <div>
        <Dialog open={isDialogOpen} onOpenChange={onDialogStateChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="default" size="default">
              Create new voice note
            </Button>
          </DialogTrigger>

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
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
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
                className="flex gap-x-2"
              >
                {finishFlow[flowState]}
                {isLoading ? (
                  <ClipLoader size="16" color="hsl(222.2,84%,4.9%)" />
                ) : null}
              </Button>
              <DialogClose asChild>
                <Button variant="destructive">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
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
