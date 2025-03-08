import { Outlet } from "@remix-run/react";
import Header from "~/components/organisms/Header/Header";
import Sidebar from "~/components/organisms/Sidebar/Sidebar";

export default function DashboardLayout() {

  return (
    <div className="flex flex-col min-h-screen">
        <Header classn="drop-shadow-lg" />
        <div className="flex flex-col sm:flex-row" style={{ height: `calc(100vh - 52px)`}}>
            <div className="max-w-[360px] w-full order-2 sm:order-1">
              <Sidebar />
            </div>
            <div className="overflow-y-auto w-full order-1 sm:order-2" >
                <Outlet/>
            </div>
        </div>
    </div>
  );
}
