// app/routes/application/task.tsx
import type { MetaFunction } from "@remix-run/node";
import { ApplicationStatus } from "~/layout/application-layout/pages/ApplicationStatus";

export const meta: MetaFunction = () => {
  return [
    { title: "Application | Status" },
    { name: "description", content: "Review your application status and verify payment." },
  ];
};

export default function ApplicationStatusRoute() {
  return <ApplicationStatus />;
}
