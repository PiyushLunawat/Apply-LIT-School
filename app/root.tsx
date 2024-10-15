import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { StrictMode } from "react";
import { ErrorPage } from "./components/pages/error-page";

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
    <html lang="en" class="dark">
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
  return <Outlet />;
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
        <ErrorPage code={500} traceTitle={errorMessage} trace={trace} />
      </StrictMode>
  )
}
