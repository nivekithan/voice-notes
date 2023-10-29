import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { SettingActionType } from "./route";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ClipLoader } from "react-spinners";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { useEffect, useState } from "react";

const addCustomPromptType = "addCustomPrompt";

export const AddCustomPromptSchema = z.object({
  type: z.literal(addCustomPromptType),
  name: z.string(),
  description: z.string(),
  systemMessage: z.string(),
  updateSystemMessage: z.string(),
});

export function AddCustomPrompt() {
  const [isAddCustomPromptDialogOpen, setIsAddCustomPromptDialogOpen] =
    useState(false);

  const addCustomPromptFetcher = useFetcher<SettingActionType>();

  const isAddingCustomPrompt =
    addCustomPromptFetcher.state === "loading" ||
    addCustomPromptFetcher.state === "submitting";

  const [
    addCustomPromptForm,
    { description, name, systemMessage, type, updateSystemMessage },
  ] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: AddCustomPromptSchema });
    },
  });

  useEffect(() => {
    if (addCustomPromptFetcher.state === "idle") {
      setIsAddCustomPromptDialogOpen(false);
    }
  }, [addCustomPromptFetcher.state]);

  return (
    <Dialog
      open={isAddCustomPromptDialogOpen}
      onOpenChange={(v) => setIsAddCustomPromptDialogOpen(v)}
    >
      <DialogTrigger asChild>
        <Button type="button">Add Custom Prompt</Button>
      </DialogTrigger>
      <DialogContent>
        <addCustomPromptFetcher.Form
          className="flex flex-col gap-y-4"
          {...addCustomPromptForm}
          method="post"
        >
          <input hidden {...conform.input(type)} value={addCustomPromptType} />

          <div className="flex flex-col gap-y-3">
            <Label className="text-lg font-semibold tracking-none">
              Custom Prompt Name:
            </Label>
            <Input placeholder="Prompt name" {...conform.input(name)} />
          </div>

          <div className="flex flex-col gap-y-3">
            <Label className="text-lg font-semibold tracking-none">
              Custom Prompt description:
            </Label>
            <Input
              placeholder="What does your prompt does ?"
              {...conform.input(description)}
            />
          </div>

          <div className="flex flex-col gap-y-3">
            <Label className="text-lg font-semibold tracking-none">
              System message:
            </Label>
            <Textarea
              placeholder="System message for your prompt"
              {...conform.textarea(systemMessage)}
            />
          </div>

          <div className="flex flex-col gap-y-3">
            <Label className="text-lg font-semibold tracking-none">
              System message when updating note:
            </Label>
            <Textarea
              placeholder="System message when you update your note using audio"
              {...conform.textarea(updateSystemMessage)}
            />
          </div>

          <div>
            <Button type="submit" className="flex gap-x-2">
              Add Custom Prompt
              {isAddingCustomPrompt ? <ClipLoader size="16" /> : null}
            </Button>
          </div>
        </addCustomPromptFetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
