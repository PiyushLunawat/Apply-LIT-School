import { MetaFunction } from "@remix-run/node";
import PersonalDocumentsDashboard from "~/layout/dashboard-layout/pages/personal-documents";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Personal Documents" },
    { name: "description", content: "Register for an account" },
  ];
};
export default function DashboardPersonalDocuments() {
  return (
    <PersonalDocumentsDashboard />
  );
}