// app/routes/application.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import ApplicationLayout from "~/layout/application-layout/components/ApplicationLayout";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const session = await getSession(request.headers.get("Cookie"));
//   const token = session.get("userToken");

//   console.log("app Token",token);
  

//   // If no token, or if it's expired (session is empty), redirect to login
//   if (!token) {    
//   console.log("fucckkkkk");
//   return redirect("/auth/login");
//   }

//   // Otherwise, proceed with your loader logic
//   return null; // or return some data
// }

export default function ApplicationRoute() {
  return (
    <ApplicationLayout/>
  );
}
