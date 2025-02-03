import { Outlet } from "@remix-run/react";
import { useContext } from "react";
import Header from "~/components/organisms/Header/Header";
import Sidebar from "~/components/organisms/Sidebar/Sidebar";
import { UserContext } from "~/context/UserContext";

export default function DashboardLayout() {

  return (
        <main>
              <Header subtitle="" classn="drop-shadow-lg" />
              <div className="flex">
                  <Sidebar />
                  <div className="overflow-y-auto w-full" style={{ height: `calc(100vh - 52px)`}}>
                      <Outlet/>
                  </div>
              </div>
        </main>
  );
}
