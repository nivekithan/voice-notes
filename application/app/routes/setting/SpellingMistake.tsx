import { conform, useForm } from "@conform-to/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ClipLoader } from "react-spinners";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { SettingActionType, SettingLoaderType } from "./route";
import { parse } from "@conform-to/zod";

export const UpdateSpellingMistakeSchema = z.object({
  spellingMistake: z.string(),
  type: z.literal("updateSpellingMistake"),
});

export function SpellingMistakeForm() {
  const { spellingMistake } = useLoaderData<SettingLoaderType>();

  const [
    spellingMistakeForm,
    { spellingMistake: spellingMistakeInput, type: typeInput },
  ] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateSpellingMistakeSchema });
    },
  });

  const updateSpellingMistakeFetcher = useFetcher<SettingActionType>();

  const isUpdatingSpellingMistake =
    updateSpellingMistakeFetcher.state === "loading" ||
    updateSpellingMistakeFetcher.state === "submitting";

  return (
    <updateSpellingMistakeFetcher.Form
      method="post"
      {...spellingMistakeForm}
      className="flex flex-col gap-y-4 w-[644px]"
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
      <div className="flex justify-end">
        <Button type="submit" className="flex gap-x-2">
          Update
          {isUpdatingSpellingMistake ? <ClipLoader size="16" /> : null}
        </Button>
      </div>
    </updateSpellingMistakeFetcher.Form>
  );
}
