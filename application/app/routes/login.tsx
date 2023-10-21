import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { HankoAuth } from "~/components/hankoAuth";
import { getUserStatus } from "~/lib/utils/auth.server";
import { EnvVariables } from "~/lib/utils/env.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { status } = await getUserStatus(request, context.env as EnvVariables);

  if (status === "logged-in") {
    return redirect("/");
  }

  return null;
}
export default function Component() {
  return (
    <main className="grid place-items-center min-h-screen">
      <HankoAuth />
    </main>
  );
}
