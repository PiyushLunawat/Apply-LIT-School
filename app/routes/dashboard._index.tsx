import { MetaFunction } from "@remix-run/node";
import ApplicationDashboard from "~/components/pages/dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Dashboard() {
    return (
      <ApplicationDashboard />
    )
  }