import {
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import { getNotes } from "~/models/notes";

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

  return <pre>{JSON.stringify(note, null, 2)}</pre>;
}
