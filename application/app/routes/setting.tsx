import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { requireUser } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";
import {
  getSpellingMistake,
  setSpellingMistake,
} from "~/models/spellingMistake";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const spellingMistake = await getSpellingMistake({ db, userId });

  return json({ spellingMistake });
}

const UpdateSpellingMistakeSchema = z.object({
  spellingMistake: z.string(),
  type: z.literal("updateSpellingMistake"),
});

export async function action({ context, request }: ActionFunctionArgs) {
  const env = context.env as EnvVariables;
  const userId = await requireUser(request, env);
  const db = drizzle(env.DB);

  const formData = await request.formData();
  const submission = parse(formData, { schema: UpdateSpellingMistakeSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json({ submission }, { status: 400 });
  }

  const submitedData = submission.value;

  if (submitedData.type === "updateSpellingMistake") {
    const { spellingMistake } = submitedData;
    await setSpellingMistake({ db, spellingMistake, userId });
    return json({ submission });
  }
}

export default function Component() {
  const { spellingMistake } = useLoaderData<typeof loader>();

  const [
    spellingMistakeForm,
    { spellingMistake: spellingMistakeInput, type: typeInput },
  ] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateSpellingMistakeSchema });
    },
  });

  return (
    <main className="flex flex-col items-center p-4 gap-y-10">
      <h1 className="text-4xl tracking-none font-bold">Settings</h1>
      <div>
        <Form
          method="post"
          {...spellingMistakeForm}
          className="flex flex-col gap-y-4"
        >
          <input
            {...conform.input(typeInput)}
            hidden
            onChange={() => {}}
            value="updateSpellingMistake"
          />

          <div className="flex flex-col gap-y-2">
            <Label
              className="text-lg font-semibold tracking-none "
              htmlFor="spelling-mistake"
            >
              Common Ai spelling mistakes:
            </Label>
            <Textarea
              {...conform.textarea(spellingMistakeInput)}
              defaultValue={spellingMistake?.spellingMistake}
              className="w-[644px]"
              id="spelling-mistake"
            />
          </div>
          <div className="flex justify-start">
            <Button type="submit">Update</Button>
          </div>
        </Form>
      </div>
    </main>
  );
}
