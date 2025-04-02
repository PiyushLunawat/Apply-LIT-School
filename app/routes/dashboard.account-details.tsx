import { MetaFunction } from "@remix-run/node";
import AccountDetailsDashboard from "~/layout/dashboard-layout/pages/account-details";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Account Details" },
    { name: "description", content: "Register for an account" },
  ];
};

export default function DashboardAccountDetails() {
    return (
      <AccountDetailsDashboard />
    );
  }