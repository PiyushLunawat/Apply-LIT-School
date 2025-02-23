// app/sessions.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

// Provide your own secret(s) here. For production, load from env.
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    // Usually want `secure: true` in production
    secure: process.env.NODE_ENV === "production",
    secrets: ["YOUR_SUPER_SECRET"], // or an array of secrets
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 60, // for example, 4 hours
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
