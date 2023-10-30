import { Link, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { HomeLoader } from "./route";

export function AllNotesPreview() {
  const { notes } = useLoaderData<HomeLoader>();

  return notes.map((note) => {
    return <NotePreview key={note.id} {...note} />;
  });
}

type NotePreviewProps = {
  id: string;
  title: string | null;
  content: string | null;
};

function NotePreview(note: NotePreviewProps) {
  return (
    <Link
      to={`/notes/${note.id}`}
      key={note.id}
      prefetch="intent"
      unstable_viewTransition
    >
      <Card className="hover:border-primary min-h-[150px]">
        <CardHeader className="flex flex-row justify-between gap-x-4 ">
          <div className="flex flex-col gap-y-1.5">
            <CardTitle className="leading-8 line-clamp-2">
              {note.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 leading-6">
              {note.content}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
