import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import {
  deleteNote,
  getNotes,
  updateContent,
  updateTitleAndContent,
} from "~/models/notes";
import { DebouncedAutosizeTextArea, DebouncedInput } from "./debouncedInput";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Recorder } from "~/components/recorder";
import { useAudioRecorder } from "~/hooks/useAudioRecorder";
import { findPrompt } from "~/lib/prompt";
import { updateTextWithAudio } from "~/lib/speechToText.server";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { getSpellingMistake } from "~/models/spellingMistake";
import { Delete } from "lucide-react";
import { DeleteNote, DeleteNoteSchema } from "./deleteNote";

const RouteParamSchema = z.object({ noteId: z.string() });

export function meta({
  data,
}: MetaArgs<typeof loader>): ReturnType<MetaFunction> {
  const note = data?.note?.title;

  return [{ title: note }];
}

const CompleteNoteScehma = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  transcript: z.string(),
});

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const { noteId } = RouteParamSchema.parse(params);
  const note = await getNotes({ db, noteId, userId });

  if (note === null) {
    throw new Response("Not found", { status: 404 });
  }
  const completedNote = CompleteNoteScehma.parse(note);

  return json({ note: completedNote });
}

const UpdateNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.literal("updateNote"),
});

const UpdateNoteUsingAudioSchema = z.object({
  audio: z.instanceof(File, { message: "audio is required" }),
  type: z.literal("updateNoteUsingAudio"),
});

export type NotePageAction = typeof action;
export async function action({ request, context, params }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);
  const { noteId } = RouteParamSchema.parse(params);

  const formData = await request.formData();
  const submission = parse(formData, {
    schema: z.discriminatedUnion("type", [
      UpdateNoteSchema,
      UpdateNoteUsingAudioSchema,
      DeleteNoteSchema,
    ]),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json({ submission }, { status: 400 });
  }

  const parsedFormData = submission.value;

  if (parsedFormData.type === "updateNote") {
    const { content, title } = parsedFormData;
    await updateTitleAndContent({ content, db, noteId, title, userId });
  } else if (parsedFormData.type === "updateNoteUsingAudio") {
    const { audio } = parsedFormData;
    const [note, spellingMistake] = await Promise.all([
      getNotes({ db, noteId, userId }),
      getSpellingMistake({ db, userId }),
    ]);

    if (!note) {
      throw new Response("Invalid noteId", { status: 400 });
    }

    const currentText = note.content;

    if (!currentText) {
      throw new Response("Note is not completly processed yet", {
        status: 400,
      });
    }

    const promptId = note.promptId;
    const prompt = await findPrompt({ db, promptId, userId });

    if (!prompt) {
      throw new Response("Invalid prompt Id", { status: 400 });
    }

    const updatedSystemMessage = prompt.updateSystemMessage;

    const { content } = await updateTextWithAudio({
      audio,
      currentText,
      env,
      systemMessage: updatedSystemMessage,
      spellingMistake: spellingMistake?.spellingMistake || "",
    });

    await updateContent({ content, db, noteId, userId });
  } else if (parsedFormData.type === "deleteNote") {
    await deleteNote({ db, noteId, userId });
    throw redirect("/");
  } else {
    throw new Error("Unpected type");
  }

  return json({ submission });
}

export default function Component() {
  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const autoSaveFetcher = useFetcher<typeof action>();
  const updateNoteUsingAudioFetcher = useFetcher<typeof action>();

  const isAudioSubmitting =
    updateNoteUsingAudioFetcher.state === "submitting" ||
    updateNoteUsingAudioFetcher.state === "loading";

  const [isRecorderDialogOpen, setIsRecorderDialogOpen] = useState(false);

  const [updateNoteForm, { content, title, type }] = useForm({
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateNoteSchema });
    },
  });

  const {
    pauseRecording,
    recordingStatus,
    resumeRecording,
    startRecording,
    stopRecording,
    timer,
    Visualizer,
  } = useAudioRecorder();

  const isRecording = recordingStatus === "RECORDING";

  async function onMicClick() {
    if (recordingStatus === "STOPPED") {
      await startRecording();
    } else if (recordingStatus === "RECORDING") {
      await pauseRecording();
    } else if (recordingStatus === "PAUSED") {
      await resumeRecording();
    }
  }

  function onRecorderDialogOpenChange(newState: boolean) {
    if (isRecording || isAudioSubmitting) {
      setIsRecorderDialogOpen(true);
      return;
    }

    setIsRecorderDialogOpen(newState);
  }

  useEffect(() => {
    if (updateNoteUsingAudioFetcher.state === "idle") {
      setIsRecorderDialogOpen(false);
    }
  }, [updateNoteUsingAudioFetcher.state]);

  async function onAddToNote() {
    const blob = await stopRecording();
    const audioFile = new File([blob], "audio.webm", { type: "audio/webm" });
    const formData = new FormData();

    formData.set("audio", audioFile);
    formData.set("type", "updateNoteUsingAudio");

    updateNoteUsingAudioFetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  }

  return (
    <main>
      <autoSaveFetcher.Form
        className="p-10 flex flex-col gap-y-4"
        method="POST"
        {...updateNoteForm}
      >
        <input
          hidden
          {...conform.hiddenProps}
          {...conform.input(type)}
          value="updateNote"
        />
        <div className="flex justify-between items-center">
          <DebouncedInput
            {...conform.input(title)}
            className="w-full bg-transparent text-muted-foreground outline-none text-2xl tracking-tight font-semibold leading-none"
            defaultValue={note.title}
          />
          <DeleteNote />
        </div>
        <Separator />
        <DebouncedAutosizeTextArea
          {...{ ...conform.textarea(content), style: undefined }}
          defaultValue={note.content}
          className="w-full bg-transparent outline-none leading-8 text-md text-primary resize-none self-stretch"
          key={isAudioSubmitting ? "1" : "2"}
        />
      </autoSaveFetcher.Form>
      <Dialog
        open={isRecorderDialogOpen}
        onOpenChange={onRecorderDialogOpenChange}
      >
        <DialogTrigger asChild>
          <Button>Add to note</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to note</DialogTitle>
            <DialogDescription>
              New note will be added or existing note will be modified
            </DialogDescription>
          </DialogHeader>
          <Recorder
            isRecording={isRecording}
            Visualizer={Visualizer}
            timer={timer}
            onMicClick={onMicClick}
          />
          <DialogFooter>
            <Button
              type="button"
              onClick={onAddToNote}
              className="flex gap-x-2"
            >
              <span>Add to note</span>
              {isAudioSubmitting ? (
                <ClipLoader size="16" color="hsl(222.2,84%,4.9%)" />
              ) : null}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
