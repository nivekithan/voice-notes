import { useFetcher } from "@remix-run/react";
import { NotePageAction } from "./route";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";

const deleteNoteType = "deleteNote";
export const DeleteNoteSchema = z.object({
  type: z.literal(deleteNoteType),
});

export function DeleteNote() {
  const deleteNoteFetcher = useFetcher<NotePageAction>();

  const [deleteNoteForm, { type: typeConfig }] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: DeleteNoteSchema });
    },
  });

  const isDeletingNote =
    deleteNoteFetcher.state === "loading" ||
    deleteNoteFetcher.state === "submitting";

  return (
    <deleteNoteFetcher.Form {...deleteNoteForm.props} method="post">
      <input
        hidden
        defaultValue={deleteNoteType}
        {...conform.input(typeConfig)}
      />
      <Button
        variant="destructive"
        size="icon"
        type="submit"
        className="border border-muted-foreground"
      >
        {isDeletingNote ? (
          <ClipLoader size="16" color="hsl(210,40%,98%)" />
        ) : (
          <Trash size="16" />
        )}
      </Button>
    </deleteNoteFetcher.Form>
  );
}
