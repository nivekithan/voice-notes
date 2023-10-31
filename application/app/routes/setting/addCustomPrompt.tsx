import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { SettingActionType } from "./route";
import { z } from "zod";
import { FieldConfig, conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ClipLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
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

  function onChangeDialogState(newState: boolean) {
    if (isAddingCustomPrompt) {
      return;
    }

    setIsAddCustomPromptDialogOpen(newState);
  }

  return (
    <Dialog
      open={isAddCustomPromptDialogOpen}
      onOpenChange={onChangeDialogState}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-purple-800 hover:bg-purple-900 text-white font-semibold border-2 border-primary"
        >
          Add Custom Prompt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <addCustomPromptFetcher.Form
          className="flex flex-col gap-y-4"
          {...addCustomPromptForm}
          method="post"
        >
          <input hidden {...conform.input(type)} value={addCustomPromptType} />
          <CustomPromptForm
            descriptionConfig={description}
            nameConfig={name}
            systemMessageConfig={systemMessage}
            updateSystemMessageConfig={updateSystemMessage}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="flex gap-x-2 bg-purple-800 hover:bg-purple-900 text-white font-semibold border-2 border-primary"
            >
              Add Custom Prompt
              {isAddingCustomPrompt ? <ClipLoader size="16" /> : null}
            </Button>
          </DialogFooter>
        </addCustomPromptFetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export type EditCustomPromptProps = {
  name: string;
  description: string;
  systemMessage: string;
  updateSystemMessage: string;
  promptId: string;
};

const updateCustomPromptType = "updateCustomPrompt";

export const UpdateCustomPromptSchema = z.object({
  promptId: z.string(),
  type: z.literal(updateCustomPromptType),
  name: z.string(),
  description: z.string(),
  systemMessage: z.string(),
  updateSystemMessage: z.string(),
});

export function EditCustomPrompt({
  description,
  name,
  systemMessage,
  updateSystemMessage,
  promptId,
}: EditCustomPromptProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateCustomPromptFetcher = useFetcher<SettingActionType>();

  const [updateCustomPromptForm, fieldConfig] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateCustomPromptSchema });
    },
  });

  const isEditingCustomPrompt =
    updateCustomPromptFetcher.state === "loading" ||
    updateCustomPromptFetcher.state === "submitting";

  useEffect(() => {
    if (updateCustomPromptFetcher.state === "idle") {
      setIsDialogOpen(false);
    }
  }, [updateCustomPromptFetcher.state]);

  function onChangeDialogState(newState: boolean) {
    if (isEditingCustomPrompt) {
      return;
    }

    setIsDialogOpen(newState);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={onChangeDialogState}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit Prompt</Button>
      </DialogTrigger>
      <DialogContent>
        <updateCustomPromptFetcher.Form
          className="flex flex-col gap-y-4"
          {...updateCustomPromptForm}
          method="post"
        >
          <input
            hidden
            {...conform.input(fieldConfig.type)}
            defaultValue={updateCustomPromptType}
          />
          <input
            hidden
            {...conform.input(fieldConfig.promptId)}
            defaultValue={promptId}
          />

          <CustomPromptForm
            descriptionConfig={fieldConfig.description}
            nameConfig={fieldConfig.name}
            systemMessageConfig={fieldConfig.systemMessage}
            updateSystemMessageConfig={fieldConfig.updateSystemMessage}
            defaultDescription={description}
            defaultName={name}
            defaultSystemMessage={systemMessage}
            defaultUpdateSystemMessage={updateSystemMessage}
          />

          <DialogFooter>
            <Button
              type="submit"
              className="flex gap-x-2 bg-purple-800 hover:bg-purple-900 text-white border-2 border-primary font-semibold"
            >
              Edit Prompt
              {isEditingCustomPrompt ? <ClipLoader size="16" /> : null}
            </Button>
          </DialogFooter>
        </updateCustomPromptFetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

type CustomPromptProps = {
  nameConfig: FieldConfig<unknown>;
  descriptionConfig: FieldConfig<unknown>;
  systemMessageConfig: FieldConfig<unknown>;
  updateSystemMessageConfig: FieldConfig<unknown>;

  defaultName?: string;
  defaultDescription?: string;
  defaultSystemMessage?: string;
  defaultUpdateSystemMessage?: string;
};

function CustomPromptForm({
  descriptionConfig,
  nameConfig,
  systemMessageConfig,
  updateSystemMessageConfig,

  defaultDescription,
  defaultName,
  defaultSystemMessage,
  defaultUpdateSystemMessage,
}: CustomPromptProps) {
  return (
    <>
      <div className="flex flex-col gap-y-3">
        <Label className="text-lg font-semibold tracking-none text-cyan-400">
          Custom Prompt Name:
        </Label>
        <Input
          placeholder="Prompt name"
          {...conform.input(nameConfig)}
          defaultValue={defaultName}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <Label className="text-lg font-semibold tracking-none text-cyan-400">
          Custom Prompt description:
        </Label>
        <Input
          placeholder="What does your prompt does ?"
          {...conform.input(descriptionConfig)}
          defaultValue={defaultDescription}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <Label className="text-lg font-semibold tracking-none  text-cyan-400">
          System message:
        </Label>
        <Textarea
          placeholder="System message for your prompt"
          {...conform.textarea(systemMessageConfig)}
          defaultValue={defaultSystemMessage}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <Label className="text-lg font-semibold tracking-none  text-cyan-400">
          System message when updating note:
        </Label>
        <Textarea
          placeholder="System message when you update your note using audio"
          {...conform.textarea(updateSystemMessageConfig)}
          defaultValue={defaultUpdateSystemMessage}
        />
      </div>
    </>
  );
}
