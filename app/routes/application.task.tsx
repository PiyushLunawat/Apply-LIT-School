// app/routes/application/task.tsx
import type { MetaFunction } from "@remix-run/node";
import ApplicationTask from "~/layout/application-layout/pages/ApplicationTask";

export const meta: MetaFunction = () => {
  return [
    { title: "Application | Task" },
    { name: "description", content: "Complete your assigned task or assignment." },
  ];
};

export default function ApplicationTaskRoute() {
  return <ApplicationTask />;
}
