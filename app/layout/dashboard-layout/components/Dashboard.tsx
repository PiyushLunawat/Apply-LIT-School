import { Link, useNavigate } from "@remix-run/react";
import { Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { getCurrentStudent, GetInterviewers } from "~/api/studentAPI";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { SchedulePresentation } from "~/components/organisms/schedule-presentation-dialog/schedule-presentation";
import { Skeleton } from "~/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  bgColor: string;
  border: string;
  disable?: Boolean;
}

const DashboardCard = ({ title, description, icon, to, bgColor, border, disable }: DashboardCardProps) => (
  <Link
     to={to} // Prevent navigation if disabled
    className={`rounded-xl sm:rounded-2xl ${bgColor} ${border} border-b-8 transition-opacity ${
      disable ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
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

interface ApplicationDashboardProps {
  student: any;
}

export default function ApplicationDashboard({ student }: ApplicationDashboardProps) {

  const { studentData, setStudentData } = useContext(UserContext);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);  
        console.log("dtid", student);
        setStudentData(student); 
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, []);

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const applicationDetails = latestCohort?.applicationDetails;
  const litmusTestDetails = latestCohort?.litmusTestDetails;
  const scholarshipDetails = litmusTestDetails?.scholarshipDetail;

  const formattedDate = new Date(litmusTestDetails?.litmusTestInterviews?.[litmusTestDetails?.litmusTestInterviews.length - 1]?.meetingDate).toLocaleDateString('en-US', {
    weekday: 'long',  // Full day name (e.g., "Monday")
    month: 'long',    // Full month name (e.g., "October")
    day: 'numeric'    // Day of the month (e.g., "14")
  });
  
  const handleExploreClick = () => {
    navigate('/dashboard/litmus-task');
  };

  const handleDocumentClick = () => {
    navigate('/dashboard/personal-documents');
  };

  const handleFeePaymentClick = () => {
    navigate('/dashboard/fee-payment-setup');
  };

  const handleScheduleInterview = async () => {
      const data = {
        cohortId: student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?._id,
        role: 'Litmus_test_reviewer',
      };
  
      setLoading(true);
      const response = await GetInterviewers(data);
      console.log("list", response.data);
    
      const payload = {
        emails: response.data,
        eventCategory: "Litmus Test Review", 
      };      
      try {
        const response = await fetch(
          "https://dev.cal.litschool.in/api/application-portal/get-all-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        
        setInterviewOpen(true);
        if (!response.ok) {
          throw new Error(`Failed to schedule interview: ${response.statusText}`);
        }
    
        const result = await response.json();
        setInterviewer(result.data)
        console.log("Interview scheduled successfully:", result.data);
      } 
      catch (error) {
        console.error("Error scheduling interview:", error);
      } finally {
        setLoading(false);
      }
    };

  const isLitmusDetailsAvailable = (litmusTestDetails?.status === 'completed');

  function formatTestDuration(durationDays: number): string {
    if (durationDays > 2) {
      return `${durationDays} days`;
    } else {
      // For durationDays <= 2, convert to hours.
      const totalHours = durationDays * 24;
      // Format as HH:MM:SS; here minutes and seconds are zero.
      const hoursStr = totalHours.toString().padStart(2, '0');
      return `${hoursStr}:00:00`;
    }
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://apply-lit-school.vercel.app";
  
  return (
  <>
      <div className="flex sm:flex-row flex-col gap-4 justify-between sm:items-end p-6 sm:p-[52px] bg-[#64748B1A] border-b">
        <div className="flex flex-row sm:flex-col gap-4 sm:gap-8 items-center sm:items-start">
          <Avatar className="w-16 h-16 sm:w-32 sm:h-32">
            <AvatarImage src={studentData?.profileUrl} className="object-cover" alt="@shadcn" />
            <AvatarFallback className="uppercase text-2xl">{studentData?.firstName[0]}{studentData?.lastName[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl sm:text-4xl font-normal">
            👋 Hey {studentData?.firstName+' '+studentData?.lastName},
            <div className="">welcome to your LIT portal</div>
          </h1>
        </div>
        <p className="max-w-[400px] w-full text-sm sm:text-base ">
          Here, you can access all your important details in one place, including your application status, account info,
          payment portal, and wallet transactions. Stay organized and easily manage your journey with LIT School.
        </p>
      </div>

      {/* LITMUS Test Submission Card */}
      <div className="p-6 sm:p-[52px] space-y-8">
        <div className="space-y-3">
          {student ? 
            <>
              <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border">
              <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
                <div className="spcae-y-2">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {litmusTestDetails?.status === 'pending' ? 
                      <>
                        <h2 className="text-base sm:text-xl font-semibold">LITMUS Test Submission</h2>
                        <Badge className="flex px-2 gap-1 sm:gap-2 items-center bg-black h-7">
                          <Clock className="text-[#00A3FF] w-3 h-3"/>
                          <div className="text-xs sm:text-base font-normal">{formatTestDuration(cohortDetails?.litmusTestDetail[0]?.litmusTestDuration)}</div>
                        </Badge>
                      </> :
                      <>
                        <h2 className="text-base sm:text-xl font-semibold">LITMUS Test</h2>
                        {litmusTestDetails?.status === 'completed' && 
                        <Badge className="flex px-2 gap-1 sm:gap-2 items-center bg-[#FF791F]/10 text-[#FF791F] border-[#FF791F] h-7">
                          {scholarshipDetails?.scholarshipName}
                        </Badge>
                        }
                      </>
                    }
                  </div>
                  {litmusTestDetails?.status === 'pending' ? 
                    <p className="sm:w-3/4 text-xs sm:text-base">Compete for a scholarship opportunity through your performance in this challenge. Demonstrate your skills and creativity!</p> :
                    litmusTestDetails?.status === 'submitted' ? 
                    <p className="sm:w-3/4 text-xs sm:text-base">Your submission has been made successfully. Kindly setup a presentation meeting to showcase your work.</p> :
                    litmusTestDetails?.status === 'interview scheduled' ? 
                    <div className="flex-1  flex-wrap">
                      Your presentation meeting has been scheduled for{' '}
                      <span className="flex-1 font-bold">
                        {formattedDate} at{' '}
                        {litmusTestDetails?.litmusTestInterviews?.[litmusTestDetails?.litmusTestInterviews.length - 1]?.startTime}
                      </span>
                    </div> : 
                    <div className="">
                      <h2 className="text-2xl font-medium">You have received a wavier of <span className="text-[#FF791F]">{scholarshipDetails?.scholarshipPercentage}% with a clearance of {scholarshipDetails?.scholarshipClearance}%</span></h2>
                      <p>You have shown exceptional effort, in-depth market analysis, innovative solutions to potential challenges, and clear, persuasive communication of the business ideas unique value proposition.</p>
                    </div>
                  }
                </div>
                <div className="flex gap-3">
                  {litmusTestDetails?.status === 'pending' ?
                    <Button size={'xl'} className="w-full md:w-fit" onClick={handleExploreClick}>
                      Explore
                    </Button> :
                    litmusTestDetails?.status === 'submitted' ? 
                    <Button size={'xl'} variant={'outline'} className="w-full md:w-fit" onClick={handleExploreClick}>
                      View Submission
                    </Button> :
                    litmusTestDetails?.status === 'interview scheduled' ? 
                    <Button size={'xl'} className="w-full md:w-fit" onClick={handleExploreClick}>
                      Access Dashboard
                    </Button> :
                    <Button size={'xl'} className="w-full md:w-fit" onClick={handleExploreClick}>
                      View feedback
                    </Button> 
                  }
                  {litmusTestDetails?.status === 'submitted' && 
                    <Button size={'xl'} className="w-full md:w-fit" onClick={handleScheduleInterview} disabled={loading}>
                      Book a Presentation Session
                    </Button>
                  }
                </div>
              </div>
            </div>
            {!latestCohort?.paymentDetails &&
              <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border">
                <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
                  <div className="spcae-y-2">
                    <div className="flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
                      <h2 className="text-base sm:text-xl font-semibold">Fee Payment Setup</h2>
                    </div>
                    <p className="sm:w-3/4 text-xs sm:text-base">
                      Kindly setup your fee payment process to access your dashboard.
                    </p>
                  </div>
                    <Button size={'xl'} className="w-full md:w-fit" onClick={handleFeePaymentClick}>
                      Setup Fee Payment
                    </Button>
                </div>
              </div>
            }
            </> :
            <Skeleton className="h-[125px] w-full rounded-xl" />
          }
          {/* <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border" onClick={handleDocumentClick}>
            <div className="flex justify-between items-center">
              <div className="spcae-y-2">
                <div className="flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-base sm:text-xl font-semibold">Personal Details</h2>
                </div>
                <p className="sm:w-3/4 text-xs sm:text-base">
                  Kindly upload all required personal ID documents.
                </p>
              </div>
                <Button size={'xl'} className="hidden sm:block" onClick={handleDocumentClick}>
                  Upload Documents
                </Button>
            </div>
          </div>  */}
        </div>
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="Application Documents"
            description="Access all your submission documents, task reports and personal information forms"
            icon={<img src="/assets/images/application-documents-icon.svg" className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl" />}
            to="/dashboard/application-documents"
            bgColor="bg-orange-600/10"
            border="border-orange-600"
          />
          <DashboardCard
            title="Fee Payment"
            description="Set up your fee payment process, clear your timely fee instalments and record all your transactions."
            icon={<img src="/assets/images/fee-payment-icon.svg" className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl" />}
            to="/dashboard/fee-payment-setup"
            bgColor="bg-blue-600/10"
            border="border-blue-600"
            disable={!isLitmusDetailsAvailable}
          />
          <DashboardCard
            title="Account Details"
            description="Maintain all your profile information along with your passwords."
            icon={<img src="/assets/images/account-details-icon.svg" className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl" />}
            to="/dashboard/account-details"
            bgColor="bg-[#F8E000]/10"
            border="border-[#F8E000]"
          />
          <DashboardCard
            title="Personal Documents"
            description="Maintain a record of your identification documents. These are mandatory for your course."
            icon={<img src="/assets/images/personal-documents-icon.svg" className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl" />}
            to="/dashboard/personal-documents"
            bgColor="bg-emerald-600/10"
            border="border-emerald-600"
          />
        </div>
      </div>

        <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogTitle></DialogTitle>
          <DialogContent className="max-w-2xl">
            <SchedulePresentation student={student} interviewer={interviewer} eventCategory='Litmus Test Review' redirectUrl={`${baseUrl}/dashboard/litmus-task`}/>
          </DialogContent>
        </Dialog>
  </>
  );
}