import "./tailwind.css";
import { StrictMode, useContext, useEffect, useState } from "react";
import { isRouteErrorResponse, json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useNavigate, useRouteError, } from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";

import { ErrorPage } from "./layout/error-page";

import { UserContext, UserProvider } from "./context/UserContext";
import { accessTokenCookie, refreshTokenCookie } from "./cookies/cookies";
import { RegisterInterceptor } from "./utils/interceptor";
import { useInitializeEnv } from "./hooks/useEnv";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);

  return {
    ENV: {
      REMIX_PUBLIC_API_BASE_URL: process.env.REMIX_PUBLIC_API_BASE_URL,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
    },
    accessToken, refreshToken
  };
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: 'preload', href: '/assets/fonts/geist.css', as: 'style' },
  { href: '/assets/fonts/geist.css', rel: 'stylesheet' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useInitializeEnv();
  const { accessToken, refreshToken } = useLoaderData<{ accessToken?: string, refreshToken?: string }>();
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const navigate = useNavigate();
  const { studentData, setStudentData } = useContext(UserContext);
  
  useEffect(() => {
      console.log("root");    
      RegisterInterceptor(accessToken, refreshToken, setIsUnauthorized );
  }, [accessToken]);

  const handleLogout = async () => {
    const response = await fetch("/logout", { method: "POST" });
  
    if (response.ok) {
      localStorage.clear();
      setStudentData(null);
      window.location.reload();
      setIsUnauthorized(false)
    }
  };

  return (
      <UserProvider>
      <Dialog open={isUnauthorized} onOpenChange={setIsUnauthorized}>
        <DialogTitle></DialogTitle>
        <DialogContent className='flex flex-col gap-3 px-8 sm:px-16 py-8 sm:gap-6 bg-[#1C1C1C] rounded-3xl max-w-[90vw] sm:max-w-xl mx-auto'>
          <div className="space-y-1">
            <div className="text-base sm:text-2xl">Session Expired</div>
            <div className="text-sm sm:text-base">Your session has expired. Please log in again.</div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button size="xl"className='w-full sm:w-fit px-8 bg-[#00AB7B] hover:bg-[#00AB7B]/90' onClick={handleLogout}>
              Log in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        <Outlet />
      </UserProvider>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError()
  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <StrictMode>
        <ErrorPage code={error.status} statusText={error.statusText} errorMessages={error.data.message ?? error.data} />
      </StrictMode>
    )
  }

  let errorMessage = 'Unknown error'
  let trace: string | undefined
  if (error instanceof Error) {
    errorMessage = error.message
    trace = error.stack
  }
  return (
    <StrictMode>
      <ErrorPage code={401} traceTitle={errorMessage} trace={trace} />
    </StrictMode>
  )
}

