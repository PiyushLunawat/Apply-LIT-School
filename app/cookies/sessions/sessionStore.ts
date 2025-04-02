import {
  createCookieSessionStorage,
  createSessionStorage,
} from "@remix-run/node";
import { userIdCookie } from "../cookies";

export const sessionStorage = createCookieSessionStorage({
  cookie: userIdCookie,
});

export const getSession = async (cookie: string) => {
  const session = await sessionStorage.getSession(cookie);
  return session;
};

export const commitSession = async (session: any) => {
  const cookie = await sessionStorage.commitSession(session);
  return cookie;
};

export const destroySession = async (cookie: string) => {
  const session = await sessionStorage.getSession(cookie);
  return sessionStorage.destroySession(session);
};
