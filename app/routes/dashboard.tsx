
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import DashboardLayout from "~/layout/dashboard-layout/components/DashboardLayout";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const session = await getSession(request.headers.get("Cookie"));
//   const token = session.get("userToken");

//   // If no token, or if it's expired (session is empty), redirect to login
//   if (!token) {
//     return redirect("/auth/login");
//   }

//   // Otherwise, proceed with your loader logic
//   return null; // or return some data
// }

export default function DashboardIndex() {
  return(
    <DashboardLayout />
  )
}
