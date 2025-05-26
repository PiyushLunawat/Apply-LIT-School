// app/routes/application.tsx
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { accessTokenCookie, refreshTokenCookie, userIdCookie } from "~/cookies/cookies";
import NewApplicationPage from "~/layout/new-application-layout/pages/new-application";

export const loader: LoaderFunction = async ({ request }) => {
  // Parse the cookie from the incoming request
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const userId = await userIdCookie.parse(cookieHeader);
  console.log("new applicatonssss");

  console.log("userId", userId);
  
  // Now you can use `userId` in your logic
  if (!accessToken && !refreshToken) {
    return redirect("/auth/login");
  }

  return { userId };
};

export default function NewApplicationRoute() {
  return (
    <NewApplicationPage/>
  );
}
