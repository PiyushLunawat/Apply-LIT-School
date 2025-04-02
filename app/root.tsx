import {
  isRouteErrorResponse,
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import { StrictMode, useEffect, useState } from "react";
import { ErrorPage } from "./components/pages/error-page";
import { UserProvider } from "./context/UserContext";
import { getPublicEnv } from "./utils/env.server";
import { accessTokenCookie, refreshTokenCookie } from "./cookies/cookies";
import { RegisterInterceptor } from "./utils/interceptor";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { Button } from "./components/ui/button";

interface LoaderData {
  ENV: {
    API_BASE_URL: string;
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    AWS_REGION: string,
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const envVars = getPublicEnv(); // Fetch only public environment variables
  
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);

  return json({ ENV: envVars, accessToken, refreshToken }); // ✅ Correct structure
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

  const { ENV } = useLoaderData<LoaderData>();

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`, // Make ENV available globally in the client
          }}
        />
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
  const { accessToken } = useLoaderData<LoaderData & { accessToken?: string }>();
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (accessToken) {
      RegisterInterceptor(
        accessToken, 
        // setIsUnauthorized
      );
    }
  }, [accessToken]);

  return (
    <StrictMode>
      <UserProvider>
      <Dialog open={isUnauthorized} onOpenChange={setIsUnauthorized}>
        <DialogContent className='flex flex-col gap-3 px-8 sm:px-16 py-8 sm:gap-6 bg-[#1C1C1C] rounded-3xl max-w-[90vw] sm:max-w-xl mx-auto'>
          <div className="space-y-1">
            <div className="text-base sm:text-2xl">Session Expired</div>
            <div className="text-sm sm:text-base">Your session has expired. Please log in again.</div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button size="xl"className='w-full sm:w-fit px-8 bg-[#00AB7B] hover:bg-[#00AB7B]/90'>
                Log in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        <Outlet />
      </UserProvider>
    </StrictMode>
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
