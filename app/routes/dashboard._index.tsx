// app/routes/dashboard/task.tsx
import type { MetaFunction } from "@remix-run/node";
import Home from "~/layout/dashboard-layout/pages/home";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Home" },
    { name: "description", content: "Welcome to your Dashboard." },
  ];
};

export default function DashboardIndexRoute() {
  return <Home />;
}
