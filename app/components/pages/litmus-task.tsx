import ApplicationHome from "~/components/pages/application";
import { Link } from "@remix-run/react";
import { Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import LITMUSTest from "../organisms/LITMUSTest/LITMUSTest";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  bgColor: string;
  border: string;
}

const DashboardCard = ({ title, description, icon, to, bgColor, border }: DashboardCardProps) => (
  <Link
    to={to}
    className={`p-6 rounded-2xl ${bgColor}/10 ${border} border border-b-8 hover:opacity-90 transition-opacity`}
  >
    <div className={`w-20 h-20 rounded-full ${bgColor}/40 flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-2xl font-semibold mb-2">{title}</h3>
    <p className="text-base opacity-80">{description}</p>
  </Link>
);

export default function LitmusTask() {
  const user = {
    name: "John Walker",
    school: "LIT School"
  };

  return (
  <>
  <Header subtitle={false} classn="" />
  <div className="flex">
    <Sidebar user={user}/>
    <div className="overflow-y-auto" style={{ height: `calc(100vh - 52px)`}}>
      <div className="flex justify-between items-end p-[52px] bg-[#3698FB1A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
              Litmus Task
            </Badge>
            <Badge className="flex gap-2 items-center bg-black">
              <Clock className="text-[#00A3FF] w-3 h-3"/>
              <div className="text-base font-normal">52:00:00</div>
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            Creator Marketer
            <div className="text-2xl">October, 2024</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-[13.67px] ">
          Complete your LITMUS test prior to deadline to avail a scholarship on your fee. This scholarship will be applicable on the last semester fee instalments.
        </p>
      </div>
      <LITMUSTest />

    </div>
    </div>
  </>
  );
}