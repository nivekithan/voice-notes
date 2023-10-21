/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { register, Hanko } from "@teamhanko/hanko-elements";

const hankoApiUrl = window.__remixContext?.state?.loaderData?.root?.hankoApiUrl;

if (!hankoApiUrl || typeof hankoApiUrl !== "string") {
  throw new Error("hanokoApiUrl is not set");
}

const hanko = new Hanko(hankoApiUrl);

function redirectAfterLogin() {
  window.location.href = "/";
}

hanko.onAuthFlowCompleted(() => {
  redirectAfterLogin();
});

register(hankoApiUrl);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
