import ApplicationHome from "~/components/pages/application";
import { Link } from "@remix-run/react";
import { Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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

export default function ApplicationDashboard() {
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
      <div className="flex justify-between items-end p-[52px] bg-[#64748B1A] border-b">
        <div className="space-y-8">
          <Avatar className="w-32 h-32">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-normal">
            👋 Hey {user.name},
            <div className="">welcome to your LIT portal</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-[13.67px] ">
          Here, you can access all your important details in one place, including your application status, account info,
          payment portal, and wallet transactions. Stay organized and easily manage your journey with LIT School.
        </p>
      </div>

      {/* LITMUS Test Submission Card */}
      <div className="p-[52px] space-y-4">
        <div className="space-y-3">
      <div className="bg-[#64748B1A] p-6 rounded-xl border">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-semibold">LITMUS Test Submission</h2>
              <Badge className="flex gap-2 items-center bg-black h-7">
                <Clock className="text-[#00A3FF] w-3 h-3"/>
                <div className="text-base font-normal">52:00:00</div>
              </Badge>
            </div>
            <p className="w-3/4">
              Your submission deadline has been extended. You stand to receive a scholarship based on your performance.
            </p>
          </div>
            <Button size={'xl'} className="">
              Explore
            </Button>
        </div>
      </div>
      <div className="bg-[#64748B1A] p-6 rounded-xl border mb-8 ">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-semibold">Fee Payment Setup</h2>
            </div>
            <p className="w-3/4">
              Kindly setup your fee payment process to access your dashboard.
            </p>
          </div>
            <Button size={'xl'} className="">
              Setup Fee Payment
            </Button>
        </div>
      </div>
      <div className="bg-[#64748B1A] p-6 rounded-xl border mb-8 ">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-semibold">Personal Details</h2>
            </div>
            <p className="w-3/4">
              Kindly upload all required personal ID documents.
            </p>
          </div>
            <Button size={'xl'} className="">
              Upload Documents
            </Button>
        </div>
      </div> 
      </div>
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          title="Application Documents"
          description="Access all your submission documents, task reports and personal information forms"
          icon={<FolderClosed className="w-6 h-6 text-white" />}
          to="/dashboard/documents"
          bgColor="bg-orange-600"
          border="border-orange-600"
        />
        <DashboardCard
          title="Fee Payment"
          description="Set up your fee payment process, clear your timely fee instalments and record all your transactions."
          icon={<ReceiptIndianRupee className="w-6 h-6 text-white" />}
          to="/dashboard/payment"
          bgColor="bg-blue-600"
          border="border-blue-600"
        />
        <DashboardCard
          title="Account Details"
          description="Maintain all your profile information along with your passwords."
          icon={<UserIcon className="w-6 h-6 text-white" />}
          to="/dashboard/account"
          bgColor="bg-yellow-600"
          border="border-yellow-600"
        />
        <DashboardCard
          title="Personal Documents"
          description="Maintain a record of your identification documents. These are mandatory for your course."
          icon={<FileText className="w-6 h-6 text-white" />}
          to="/dashboard/personal"
          bgColor="bg-emerald-600"
          border="border-emerald-600"
        />
      </div>
    </div>
    </div>
    </div>
  </>
  );
}