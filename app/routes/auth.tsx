// app/routes/auth.tsx
import { LoaderFunction, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { accessTokenCookie, refreshTokenCookie, userIdCookie } from '~/cookies/cookies';
import AuthLayout from '~/layout/auth-layout/components/AuthLayout';
import { RegisterInterceptor } from '~/utils/interceptor';

export const loader: LoaderFunction = async ({ request }) => {
  // Parse the cookie from the incoming request
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const userId = await userIdCookie.parse(cookieHeader);

  console.log("userId", userId);
  
  // Now you can use `userId` in your logic
  if (accessToken || refreshToken) {
    return redirect("/dashboard");
  }

  return { userId };
};

export default function AuthRoute() {
  return <AuthLayout />;
}
