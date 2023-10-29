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

export type CustomPrompProps = Pick<
  CustomPrompt,
  "name" | "description" | "systemMessage" | "updateSystemMessage"
>;

export function CustomPrompt({
  description,
  name,
  systemMessage,
  updateSystemMessage,
}: CustomPrompProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-3">
        <div>
          <h3>System Message</h3>
          <p className="text-muted-foreground line-clamp-2">{systemMessage}</p>
        </div>
        <div>
          <h3>System message while updating note</h3>
          <p className="text-muted-foreground line-clamp-2">
            {updateSystemMessage}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-x-3">
        <Button variant="outline" size="sm" type="button">
          Edit prompt
        </Button>
        <Button variant="destructive" size="sm" type="button">
          Delete prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
