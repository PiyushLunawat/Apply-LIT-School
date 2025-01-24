
import { Outlet } from "@remix-run/react";
import Header from "~/components/organisms/Header/Header";
import Sidebar from "~/components/organisms/Sidebar/Sidebar";
import ApplicationDashboard from "~/components/pages/dashboard";
import { Toaster } from "~/components/ui/toaster";
import { DashboardLayout } from "~/layout/dashboard-layout";

export default function DashboardIndex() {
  return(
    <main>
          <Header subtitle="" classn="drop-shadow-lg" />
          <div className="flex">
              <Sidebar />
              <div className="overflow-y-auto w-full" style={{ height: `calc(100vh - 52px)`}}>
                  <Outlet/>
              </div>
          </div>
    </main>
  )
}
