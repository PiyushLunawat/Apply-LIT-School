import { Outlet } from "@remix-run/react";
import Header from "~/components/organisms/Header/Header";
import Sidebar from "~/components/organisms/Sidebar/Sidebar";

export default function DashboardLayout() {

  return (
    <div className="">
        <Header classn="drop-shadow-lg" />
        <div className="flex flex-col sm:flex-row border-b h-[calc(100vh-52px)] " >
            <div className="max-w-[300px] lg:max-w-[360px] w-full order-2 sm:order-1">
              <Sidebar />
            </div>
            <div className="overflow-y-auto w-full order-1 sm:order-2" >
                <Outlet/>
            </div>
        </div>
    </div>
  );
}
