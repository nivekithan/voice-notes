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

export type CustomPrompProps = Pick<CustomPrompt, "name" | "description">;

export function CustomPrompt({ description, name }: CustomPrompProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <Button variant="secondary" type="button">
          Edit prompt
        </Button>
        <Button variant="destructive" type="button">
          Delete prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
