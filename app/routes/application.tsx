// app/routes/application.tsx
import { Outlet } from "@remix-run/react";
import ApplicationLayout from "~/layout/application-layout/components/ApplicationLayout";

export default function ApplicationRoute() {
  return (
    <ApplicationLayout/>
  );
}
