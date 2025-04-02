import { MetaFunction } from "@remix-run/node";
import LitmusTask from "~/layout/dashboard-layout/pages/litmus-task";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Litmus Test" },
    { name: "description", content: "Register for an account" },
  ];
};
export default function DashboardLitmusTask() {
  return (
    <LitmusTask />
  );
}