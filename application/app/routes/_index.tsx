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

  const promptStyles = [
    {
      id: "1",
      name: "Flashcard",
      description: "Converts your audio into question answer pairs",
    },
    {
      id: "2",
      name: "Transcribe",
      description: "Cleans your audio and transcribes it cleanly",
    },
  ];

  return json({ promptStyles, notes: allNotes });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);

  const formData = await request.formData();

  const file = formData.get("audio");

  if (!(file instanceof File)) {
    throw new Response("Expected audio to be file", { status: 400 });
  }

  const db = drizzle(env.DB);
  const audio = await file.arrayBuffer();

  const text = await convertAudioToText({ audio, env });

  const notes = await createNewNotes({
    db,
    transcript: text,
    content: text,
    title: "WIP",
    status: "DONE",
    userId,
  });
  console.log(notes);

  return json(notes);
}

type FlowState = "RECORDING" | "STYLES";

export default function Index() {
  const { promptStyles, notes } = useLoaderData<typeof loader>();
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
  const [promtStyleId, setPromptStyleId] = useState<string>(promptStyles[0].id);
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
    setPromptStyleId(promptStyles[0].id);
  }

  function onChooseStyles() {
    setFlowState("STYLES");
  }

  async function onCreateNewNote() {
    // Show loading indicator
    console.log("Running onCreateNewNote");
    const promptId = promtStyleId;
    const audioFile = await stopRecording();

    const formData = new FormData();

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
      <div className="grid grid-cols-4 gap-4">
        {notes.map((note) => {
          return (
            <Link to={`/notes/${note.id}`} key={note.id}>
              <Card className="hover:border-primary h-[150px]">
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
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
            ) : (
              <div className="flex flex-col gap-y-4">
                {promptStyles.map((value) => (
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
