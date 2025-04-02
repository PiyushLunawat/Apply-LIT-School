import { MetaFunction } from "@remix-run/node";
import FeePaymentSetupDashboard from "~/layout/dashboard-layout/pages/fee-payment";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | Fee Payment" },
    { name: "description", content: "Register for an account" },
  ];
};
export default function DashboardFeePaymentSetup() {
  return (
    <FeePaymentSetupDashboard />
  );
  }