import { MetaFunction } from "@remix-run/node";
import ApplicationDocumentsDashboard from "~/layout/dashboard-layout/pages/application-documents";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Application Documents" },
    { name: "description", content: "Register for an account" },
  ];
};
export default function DashboardApplicationDocuments() {
    return (
      <ApplicationDocumentsDashboard />
    );
  }