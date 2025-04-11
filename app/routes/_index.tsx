// app/routes/index.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { parse } from "cookie";
import { accessTokenCookie, refreshTokenCookie, userIdCookie } from "~/cookies/cookies";
import { RegisterInterceptor } from "~/utils/interceptor";

export const meta: MetaFunction = () => {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to Application Portal" },
  ];
};

// Loader function to redirect based on the presence of "user-token" cookie
export const loader: LoaderFunction = async ({ request }) => {
  // Extract the "Cookie" header from the incoming request
  const cookieHeader = request.headers.get("Cookie");

  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const userId = await userIdCookie.parse(cookieHeader);

  if (accessToken || refreshToken) {
    console.log("Token found, redirecting to /dashboard");
    return redirect("/dashboard");
  } else {
    console.log("No token found, redirecting to /auth/login");
    return redirect("/auth/login");
  }
};

export default function Index() {
  // Since the loader always redirects, this component will never render
  return null;
}
