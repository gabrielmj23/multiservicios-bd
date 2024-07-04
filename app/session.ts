import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<{ RIFSuc: string }, { error: string }>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    },
  });

export { getSession, commitSession, destroySession };
