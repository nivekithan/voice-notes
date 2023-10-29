import { parse } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import {
  getSpellingMistake,
  setSpellingMistake,
} from "~/models/spellingMistake";
import {
  SpellingMistakeForm,
  UpdateSpellingMistakeSchema,
} from "./SpellingMistake";
import {
  AddCustomPrompt,
  AddCustomPromptSchema,
  UpdateCustomPromptSchema,
} from "./addCustomPrompt";
import {
  createCustomPrompt,
  deleteCustomPrompt,
  getAllCustomPrompts,
  updateCustomPrompt,
} from "~/models/customPrompt";
import { CustomPrompt, DeleteCustomPromptSchema } from "./customPrompt";
import { addInstructionAboutTitle } from "~/lib/prompt";

export type SettingLoaderType = typeof loader;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const [spellingMistake, allCustomPrompts] = await Promise.all([
    getSpellingMistake({ db, userId }),
    getAllCustomPrompts({ db, userId }),
  ]);

  return json({ spellingMistake, allCustomPrompts });
}

export type SettingActionType = typeof action;

export async function action({ context, request }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const formData = await request.formData();
  const submission = parse(formData, {
    schema: z.discriminatedUnion("type", [
      UpdateSpellingMistakeSchema,
      AddCustomPromptSchema,
      DeleteCustomPromptSchema,
      UpdateCustomPromptSchema,
    ]),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json({ submission }, { status: 400 });
  }

  const submitedData = submission.value;

  if (submitedData.type === "updateSpellingMistake") {
    const { spellingMistake } = submitedData;
    await setSpellingMistake({ db, spellingMistake, userId });
    return json({ submission });
  } else if (submitedData.type === "addCustomPrompt") {
    const { description, name, systemMessage, updateSystemMessage } =
      submitedData;
    await createCustomPrompt({
      db,
      description,
      name,
      systemMessage,
      updateSystemMessage,
      userId,
    });
    return json({ submission });
  } else if (submitedData.type === "deleteCustomPrompt") {
    const { customPromptId } = submitedData;
    await deleteCustomPrompt({ db, promptId: customPromptId, userId });

    return json({ submission });
  } else if (submitedData.type === "updateCustomPrompt") {
    const { description, name, promptId, systemMessage, updateSystemMessage } =
      submitedData;
    await updateCustomPrompt({
      db,
      description,
      name,
      promptId,
      systemMessage,
      updateSystemMessage,
      userId,
    });
    return json({ submission });
  }
}

export default function Component() {
  const { allCustomPrompts } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col p-4 gap-y-10 items-center">
      <h1 className="text-4xl tracking-none font-bold">Settings</h1>
      <SpellingMistakeForm />
      <div className="w-[644px] flex flex-col gap-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-none">Custom Prompts</h3>
          <AddCustomPrompt />
        </div>
        <div className="flex flex-col gap-y-4">
          {allCustomPrompts.map((prompt) => {
            return (
              <CustomPrompt
                key={prompt.id}
                description={prompt.description}
                name={prompt.name}
                systemMessage={prompt.systemMessage}
                updateSystemMessage={prompt.updateSystemMessage}
                id={prompt.id}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
