import { parse } from "cookie";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { EnvVariables } from "./env.server";
import { redirect } from "@remix-run/cloudflare";

const COOKIE_NAME = "hanko";

type UserLoggedIn = { status: "logged-in"; userId: string };
type UserNotLoggedIn = { status: "not-logged-in" };

type UserStatus = UserLoggedIn | UserNotLoggedIn;

export async function requireUser(request: Request, env: EnvVariables) {
  const userStatus = await getUserStatus(request, env);
  const status = userStatus.status;

  if (status === "not-logged-in") {
    throw redirect("/login");
  }

  return userStatus.userId;
}

export async function getUserStatus(
  request: Request,
  env: EnvVariables,
): Promise<UserStatus> {
  const hanko = request.headers.get("cookie");

  if (!hanko) {
    return { status: "not-logged-in" };
  }

  const cookieValue = parse(hanko)[COOKIE_NAME];
  const jwks = createRemoteJWKSet(getHankoJwkSetUrl(env));

  const jwtStatus = await verifyJwt({ jwks, jwt: cookieValue });

  if (!jwtStatus.verified) {
    return { status: "not-logged-in" };
  }

  const userId = jwtStatus.paylod.sub;

  if (!userId) {
    throw new Error("There is no userId in jwt");
  }

  return { status: "logged-in", userId };
}

function getHankoJwkSetUrl(env: EnvVariables) {
  return new URL(`${env.HANKO_API_URL}/.well-known/jwks.json`);
}

async function verifyJwt({
  jwks,
  jwt,
}: {
  jwt: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
}) {
  try {
    const verifiedJwt = await jwtVerify(jwt, jwks);
    return { verified: true, paylod: verifiedJwt.payload } as const;
  } catch (err) {
    return { verified: false } as const;
  }
}
