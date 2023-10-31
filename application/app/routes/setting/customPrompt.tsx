import { useFetcher } from "@remix-run/react";
import { Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type CustomPrompt } from "~/models/customPrompt";
import { SettingActionType } from "./route";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { ClipLoader } from "react-spinners";
import { EditCustomPrompt } from "./addCustomPrompt";

export type CustomPrompProps = Pick<
  CustomPrompt,
  "name" | "description" | "systemMessage" | "updateSystemMessage" | "id"
>;

const deleteCustomPromptType = "deleteCustomPrompt";

export const DeleteCustomPromptSchema = z.object({
  customPromptId: z.string(),
  type: z.literal(deleteCustomPromptType),
});

export function CustomPrompt({
  description,
  name,
  systemMessage,
  updateSystemMessage,
  id,
}: CustomPrompProps) {
  const deleteCustomPromptFetcher = useFetcher<SettingActionType>();

  const [deleteCustomPromptForm, { customPromptId, type }] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: DeleteCustomPromptSchema });
    },
  });

  const isdeletingPrompt =
    deleteCustomPromptFetcher.state === "loading" ||
    deleteCustomPromptFetcher.state === "submitting";

  return (
    <Card>
      <CardHeader className="flex items-center flex-row justify-between">
        <div className="flex flex-col gap-y-1.5">
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <deleteCustomPromptFetcher.Form
          {...deleteCustomPromptForm}
          method="post"
        >
          <input
            {...conform.input(type)}
            hidden
            defaultValue={deleteCustomPromptType}
          />
          <input {...conform.input(customPromptId)} hidden defaultValue={id} />
          <Button
            variant="destructive"
            size="icon"
            type="submit"
            className="border border-muted-foreground"
          >
            {isdeletingPrompt ? (
              <ClipLoader size="16" color="hsl(210,40%,98%)" />
            ) : (
              <Trash size="16" />
            )}
          </Button>
        </deleteCustomPromptFetcher.Form>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-3">
        <div>
          <h3 className="font-semibold">System Message</h3>
          <p className="text-muted-foreground line-clamp-2">{systemMessage}</p>
        </div>
        <div>
          <h3 className="font-semibold">System message while updating note</h3>
          <p className="text-muted-foreground line-clamp-2">
            {updateSystemMessage}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-x-3 justify-end">
        <EditCustomPrompt
          description={description}
          name={name}
          promptId={id}
          systemMessage={systemMessage}
          updateSystemMessage={updateSystemMessage}
        />
      </CardFooter>
    </Card>
  );
}
