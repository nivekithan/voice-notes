import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
  json,
} from "@remix-run/cloudflare";
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { getNotes, updateTitleAndContent } from "~/models/notes";
import { DebouncedAutosizeTextArea, DebouncedInput } from "./debouncedInput";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";

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
  const completedNote = CompleteNoteScehma.parse(note);

  return json({ note: completedNote });
}

const SaveNoteSchema = z.object({ title: z.string(), content: z.string() });

export async function action({ request, context, params }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);
  const { noteId } = RouteParamSchema.parse(params);

  const formData = await request.formData();
  const submission = parse(formData, { schema: SaveNoteSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json({ submission });
  }

  const { content, title } = submission.value;
  await updateTitleAndContent({ content, db, noteId, title, userId });

  return json({ submission });
}

export default function Component() {
  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const [form, { content, title }] = useForm({
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SaveNoteSchema });
    },
  });

  return (
    <main>
      <fetcher.Form
        className="p-10 flex flex-col gap-y-4"
        method="POST"
        {...form}
      >
        <DebouncedInput
          {...conform.input(title)}
          className="w-full bg-transparent text-muted-foreground outline-none text-2xl tracking-tight font-semibold leading-none"
          defaultValue={note.title}
        />
        <Separator />
        <DebouncedAutosizeTextArea
          {...{ ...conform.textarea(content), style: undefined }}
          defaultValue={note.content}
          className="w-full bg-transparent outline-none leading-8 text-md text-primary resize-none self-stretch"
        />
      </fetcher.Form>
    </main>
  );
}
