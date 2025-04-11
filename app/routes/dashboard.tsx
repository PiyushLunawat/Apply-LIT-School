
import { LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { accessTokenCookie, refreshTokenCookie, userIdCookie } from "~/cookies/cookies";
import DashboardLayout from "~/layout/dashboard-layout/components/DashboardLayout";
import { RegisterInterceptor } from "~/utils/interceptor";

export const loader: LoaderFunction = async ({ request }) => {
  // Parse the cookie from the incoming request
  const cookieHeader = request.headers.get("Cookie");
    const accessToken = await accessTokenCookie.parse(cookieHeader);
    const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const userId = await userIdCookie.parse(cookieHeader);
  
      RegisterInterceptor(accessToken, refreshToken);
    

  // Now you can use `userId` in your logic
  if (!accessToken && !refreshToken) {
    return redirect("/auth/login");
  }

  // ... fetch user data, etc. ...
  return { userId };
};


export default function DashboardIndex() {
  return(
    <DashboardLayout />
  )
}
