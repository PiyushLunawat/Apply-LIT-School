// app/routes/application/index.tsx
import type { MetaFunction } from "@remix-run/node";
import ApplicationDetails from "~/layout/application-layout/pages/ApplicationDetails";

export const meta: MetaFunction = () => {
  return [
    { title: "Application | Details" },
    { name: "description", content: "Fill out your initial application details." },
  ];
};

export default function ApplicationIndexRoute() {
  return <ApplicationDetails />;
}
