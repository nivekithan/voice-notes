import {
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { getNotes } from "~/models/notes";
import AutoSizeTextArea from "react-textarea-autosize";

const RouteParamSchema = z.object({ noteId: z.string() });

export function meta({
  data,
}: MetaArgs<typeof loader>): ReturnType<MetaFunction> {
  const note = data?.note?.title;

  return [{ title: note }];
}
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const { noteId } = RouteParamSchema.parse(params);
  const note = await getNotes({ db, noteId, userId });

  return json({ note: note });
}

export default function Component() {
  const { note } = useLoaderData<typeof loader>();

  const title = note?.title;

  if (typeof title !== "string") {
    throw new Error("Title is not avaliable");
  }

  const content = note?.content;

  if (typeof content !== "string") {
    throw new Error("Content is not avaliable");
  }

  return (
    <main className="p-10 flex flex-col gap-y-4">
      <input
        className="w-full bg-transparent text-muted-foreground outline-none text-2xl tracking-tight font-semibold leading-none"
        defaultValue={title}
      />
      <Separator />
      <AutoSizeTextArea
        defaultValue={content}
        className="w-full bg-transparent outline-none leading-8 text-md text-primary resize-none self-stretch"
      />
    </main>
  );
}
