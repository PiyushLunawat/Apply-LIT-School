import ApplicationHome from "~/components/pages/application";
import { Link, useNavigate } from "@remix-run/react";
import { Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { getCurrentStudent } from "~/utils/studentAPI";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  bgColor: string;
  border: string;
  disable: Boolean;
}

const DashboardCard = ({ title, description, icon, to, bgColor, border, disable }: DashboardCardProps) => (
  <Link
     to={'#'} // Prevent navigation if disabled
    className={`rounded-2xl ${bgColor} ${border} border-b-8 hover:opacity-90 transition-opacity ${
      disable ? "opacity-10 cursor-not-allowed" : ""
    }`}
    onClick={(e) => disable && e.preventDefault()} // Prevent link click if disabled
  >
    <div className="hidden sm:block">
      {icon}
    </div>
    <div className='flex gap-4 items-center sm:hidden'>
      {icon}
      <h3 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h3>
    </div>
    <div className="mx-4 my-3 sm:m-6">
      <h3 className="hidden sm:block text-base text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base opacity-80">{description}</p>
    </div>
  </Link>
);

export default function ApplicationDashboard() {

  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
        setStudent(student.data); // Store the fetched data in state
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, []);
  
  const handleExploreClick = () => {
    navigate('/dashboard/litmus-task');
  };

  const handleDocumentClick = () => {
    navigate('/dashboard/personal-documents');
  };

  const handleFeePaymentClick = () => {
    navigate('/dashboard/fee-payment-setup');
  };

  const isLitmusDetailsAvailable = !!student?.litmusTestDetails?.length;

  return (
  <>
      <div className="flex justify-between items-end p-[52px] bg-[#64748B1A] border-b">
        <div className="space-y-8">
          <Avatar className="w-32 h-32">
            <AvatarImage src={studentData?.profileUrl} className="object-cover" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-normal">
            👋 Hey {student?.firstName+' '+student?.lastName},
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
            <Button size={'xl'} onClick={handleExploreClick}>
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
            <Button size={'xl'} className="" onClick={handleFeePaymentClick}>
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
            <Button size={'xl'} className="" onClick={handleDocumentClick}>
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
          icon={<img src="/assets/images/application-documents-icon.svg" className="w-[120px] h-[120px] text-white" />}
          to="/dashboard/application-documents"
          bgColor="bg-orange-600/10"
          border="border-orange-600"
          disable={!isLitmusDetailsAvailable}
        />
        <DashboardCard
          title="Fee Payment"
          description="Set up your fee payment process, clear your timely fee instalments and record all your transactions."
          icon={<img src="/assets/images/fee-payment-icon.svg" className="w-[120px] h-[120px] text-white" />}
          to="/dashboard/fee-payment-setup"
          bgColor="bg-blue-600/10"
          border="border-blue-600"
          disable={!isLitmusDetailsAvailable}
        />
        <DashboardCard
          title="Account Details"
          description="Maintain all your profile information along with your passwords."
          icon={<img src="/assets/images/account-details-icon.svg" className="w-[120px] h-[120px] text-white" />}
          to="/dashboard/account-details"
          bgColor="bg-[#F8E000]/10"
          border="border-[#F8E000]"
          disable={!isLitmusDetailsAvailable}
        />
        <DashboardCard
          title="Personal Documents"
          description="Maintain a record of your identification documents. These are mandatory for your course."
          icon={<img src="/assets/images/personal-documents-icon.svg" className="w-[120px] h-[120px] text-white" />}
          to="/dashboard/personal-documents"
          bgColor="bg-emerald-600/10"
          border="border-emerald-600"
          disable={!isLitmusDetailsAvailable}
        />
      </div>
    </div>
  </>
  );
}