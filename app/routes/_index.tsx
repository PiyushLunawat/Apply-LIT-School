import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function to redirect to /login
export const loader: LoaderFunction = async () => {
  return redirect("/login");
};

export default function Index() {
  return null; // Since we're redirecting, there's no need to render anything
}
