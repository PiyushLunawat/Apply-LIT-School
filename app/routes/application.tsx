// app/routes/application.tsx
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import {
  accessTokenCookie,
  refreshTokenCookie,
  userIdCookie,
} from "~/cookies/cookies";
import ApplicationLayout from "~/layout/application-layout/components/ApplicationLayout";

export const loader: LoaderFunction = async ({ request }) => {
  // Parse the cookie from the incoming request
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const userId = await userIdCookie.parse(cookieHeader);

  // Now you can use `userId` in your logic
  if (!accessToken && !refreshToken) {
    return redirect("/auth/login");
  }

  return { userId };
};

export default function ApplicationRoute() {
  return <ApplicationLayout />;
}
