import { Link, useNavigate } from "@remix-run/react";
import { Clock, ClockArrowUp } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { GetInterviewers } from "~/api/studentAPI";
import { SchedulePresentation } from "~/components/organisms/schedule-presentation-dialog/schedule-presentation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { UserContext } from "~/context/UserContext";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  bgColor: string;
  border: string;
  disable?: boolean;
}

const DashboardCard = ({
  title,
  description,
  icon,
  to,
  bgColor,
  border,
  disable,
}: DashboardCardProps) => (
  <Link
    to={to} // Prevent navigation if disabled
    className={`rounded-xl sm:rounded-2xl ${bgColor} ${border} border-b-8 transition-opacity ${
      disable ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
    }`}
    onClick={(e) => disable && e.preventDefault()} // Prevent link click if disabled
  >
    <div className="hidden sm:block">{icon}</div>
    <div className="flex gap-4 items-center sm:hidden">
      {icon}
      <h3 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h3>
    </div>
    <div className="mx-4 my-3 sm:m-6">
      <h3 className="hidden sm:block text-base text-2xl font-semibold mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base opacity-80">{description}</p>
    </div>
  </Link>
);

interface ApplicationDashboardProps {
  student: any;
}

export default function ApplicationDashboard({
  student,
}: ApplicationDashboardProps) {
  const { studentData, setStudentData, refreshStudentData, isRefreshing } =
    useContext(UserContext);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  const navigate = useNavigate();

  // Effect for initial data load
  useEffect(() => {
    // Use the refreshStudentData function from UserContext for initial data load
    if (studentData?._id) {
      refreshStudentData();
    }
  }, [studentData?._id, refreshStudentData]);

  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const applicationDetails = latestCohort?.applicationDetails;
  const litmusTestDetails = latestCohort?.litmusTestDetails;
  const scholarshipDetails = litmusTestDetails?.scholarshipDetail;

  const formattedDate = new Date(
    litmusTestDetails?.litmusTestInterviews?.[
      litmusTestDetails?.litmusTestInterviews.length - 1
    ]?.meetingDate
  ).toLocaleDateString("en-US", {
    weekday: "long", // Full day name (e.g., "Monday")
    month: "long", // Full month name (e.g., "October")
    day: "numeric", // Day of the month (e.g., "14")
  });

  const handleExploreClick = () => {
    navigate("/dashboard/litmus-task");
  };

  const handleDocumentClick = () => {
    navigate("/dashboard/personal-documents");
  };

  const handleFeePaymentClick = () => {
    navigate("/dashboard/fee-payment");
  };

  const handleDocumentsClick = () => {
    navigate("/dashboard/personal-documents");
  };

  const handleScheduleInterview = async () => {
    const data = {
      cohortId:
        student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId
          ?._id,
      role: "Litmus_test_reviewer",
    };

    setLoading(true);
    const response = await GetInterviewers(data);
    console.log("list", response.data);

    const payload = {
      emails: response.data,
      eventCategory: "Litmus Test Interview",
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
      setInterviewer(result.data);
      console.log("Interview scheduled successfully:", result.data);
    } catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLitmusDetailsAvailable = litmusTestDetails?.status === "completed";

  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const days =
      latestCohort?.cohortId?.litmusTestDetail[0]?.litmusTestDuration ?? 0;
    const now = new Date();
    const targetDate = new Date(latestCohort?.tokenFeeDetails?.updatedAt);
    const diffInSeconds = Math.floor(
      (targetDate.getTime() - now.getTime()) / 1000
    );
    setRemainingTime(Math.floor(days * 24 * 60 * 60 + diffInSeconds));
  }, [student]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval); // clean up on unmount
  }, []);

  const formatHHMMSS = (totalSeconds: number): string => {
    const totalHours = Math.floor(totalSeconds / 3600);

    if (totalHours <= 72) {
      const hrs = totalHours;
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${String(hrs).padStart(2, "0")}H:${String(mins).padStart(
        2,
        "0"
      )}M:${String(secs).padStart(2, "0")}S`;
    } else {
      const days = Math.floor(totalSeconds / (24 * 3600));
      const remainingSeconds = totalSeconds % (24 * 3600);
      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      return `${days}D:${hrs}H:${mins}M`;
    }
  };

  const colorClasses = [
    "text-emerald-600 !bg-emerald-600/20 border-emerald-600",
    "text-[#3698FB] !bg-[#3698FB]/20 border-[#3698FB]",
    "text-[#FA69E5] !bg-[#FA69E5]/20 border-[#FA69E5]",
    "text-orange-600 !bg-orange-600/20 border-orange-600",
  ];

  const getBadgeColor = (slabName: string): string => {
    const index =
      cohortDetails?.litmusTestDetail?.[0]?.scholarshipSlabs.findIndex(
        (slab: any) => slab.name === slabName
      );
    return index !== -1
      ? colorClasses[index % colorClasses.length]
      : "text-default";
  };

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://apply-lit-school.vercel.app";

  const taskScores = litmusTestDetails?.results || [];
  let totalScore = 0;
  let totalPercentage = 0;
  let maxScore = 0;

  taskScores.forEach((task: any) => {
    const taskScore = task?.score?.reduce(
      (acc: any, criterion: any) => acc + criterion.score,
      0
    );
    const taskMaxScore = task?.score?.reduce(
      (acc: any, criterion: any) => acc + Number(criterion.totalScore),
      0
    );
    const taskPercentage = taskMaxScore ? (taskScore / taskMaxScore) * 100 : 0;
    totalScore += taskScore;
    totalPercentage += taskPercentage;
    maxScore += taskMaxScore;
  });

  const avgTaskScore = totalPercentage / taskScores.length;

  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 justify-between md:items-end py-8 sm:py-[52px] px-[52px] bg-[#64748B1A] border-b">
        <div className="flex flex-row md:flex-col gap-4 md:gap-8 items-center md:items-start">
          <div className="relative">
            <Avatar className="w-16 h-16 sm:w-32 sm:h-32">
              <AvatarImage
                src={student?.profileUrl || studentData?.profileUrl}
                className="object-cover"
                alt="@shadcn"
              />
              <AvatarFallback className="uppercase text-2xl">
                {studentData?.firstName?.[0]}
                {studentData?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-xl sm:text-4xl font-normal">
            👋 Hey{" "}
            {(student?.firstName || studentData?.firstName) +
              " " +
              (student?.lastName || studentData?.lastName)}
            ,<div className="">welcome to your LIT portal</div>
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <p className="max-w-[400px] w-full text-sm sm:text-base ">
            Here, you can access all your important details in one place,
            including your application status, account info, payment portal, and
            wallet transactions. Stay organized and easily manage your journey
            with LIT School.
          </p>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={refreshStudentData}
              disabled={isRefreshing}
            >
              <ClockArrowUp
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>

      {/* LITMUS Test Submission Card */}
      <div className="px-4 py-[52px] sm:p-[52px] space-y-8">
        <div className="space-y-3">
          {student ? (
            <>
              <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border">
                <div className="flex flex-wrap flex-col md:flex-row gap-2 justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {litmusTestDetails?.status === "pending" ? (
                        <>
                          <h2 className="text-lg sm:text-xl font-semibold">
                            LITMUS Test Submission
                          </h2>
                          <Badge className="flex px-2 gap-1 sm:gap-2 items-center bg-black h-7">
                            <Clock className="text-[#00A3FF] w-3 h-3" />
                            <div className="text-xs sm:text-base font-normal">
                              {formatHHMMSS(remainingTime)}
                            </div>
                          </Badge>
                        </>
                      ) : (
                        <>
                          <h2 className="text-lg sm:text-xl font-semibold">
                            LITMUS Test
                          </h2>
                          {litmusTestDetails?.status === "completed" && (
                            <Badge
                              className={`flex px-2 gap-1 sm:gap-2 items-center ${getBadgeColor(
                                scholarshipDetails?.scholarshipName
                              )} h-7`}
                            >
                              {scholarshipDetails?.scholarshipName}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    {litmusTestDetails?.status === "pending" ? (
                      <p className="sm:max-w-[500px] text-xs sm:text-base">
                        Compete for a scholarship opportunity through your
                        performance in this challenge. Demonstrate your skills
                        and creativity!
                      </p>
                    ) : litmusTestDetails?.status === "submitted" ||
                      litmusTestDetails?.status === "interview cancelled" ? (
                      <p className="sm:max-w-[500px] text-xs sm:text-base">
                        Your submission has been made successfully. Kindly setup
                        a presentation meeting to showcase your work.
                      </p>
                    ) : litmusTestDetails?.status === "interview scheduled" ? (
                      <div className="flex-1  flex-wrap">
                        Your presentation meeting has been scheduled for{" "}
                        <span className="flex-1 font-bold">
                          {formattedDate} at{" "}
                          {
                            litmusTestDetails?.litmusTestInterviews?.[
                              litmusTestDetails?.litmusTestInterviews.length - 1
                            ]?.startTime
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:max-w-[700px] flex-1 gap-y-1">
                        <h2 className="text-lg sm:text-2xl leading-none font-medium">
                          You have received a wavier of{" "}
                          <span
                            className={`!bg-transparent border-none ${getBadgeColor(
                              scholarshipDetails?.scholarshipName
                            )}`}
                          >
                            {scholarshipDetails?.scholarshipPercentage}% with a
                            clearance of {avgTaskScore.toFixed(2) || "--"}%
                          </span>
                        </h2>
                        <p className="text-xs sm:text-base">
                          You have shown exceptional effort, in-depth market
                          analysis, innovative solutions to potential
                          challenges, and clear, persuasive communication of the
                          business ideas unique value proposition.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap w-full md:w-fit gap-3">
                    {litmusTestDetails?.status === "pending" ? (
                      <Button
                        size={"xl"}
                        className="w-full md:w-fit"
                        onClick={handleExploreClick}
                      >
                        Explore
                      </Button>
                    ) : litmusTestDetails?.status === "submitted" ||
                      litmusTestDetails?.status === "interview cancelled" ? (
                      <Button
                        size={"xl"}
                        variant={"outline"}
                        className="w-full md:w-fit"
                        onClick={handleExploreClick}
                      >
                        View Submission
                      </Button>
                    ) : litmusTestDetails?.status === "interview scheduled" ? (
                      <Button
                        size={"xl"}
                        className="w-full md:w-fit"
                        onClick={handleExploreClick}
                      >
                        Access Dashboard
                      </Button>
                    ) : (
                      <Button
                        size={"xl"}
                        className="w-full md:w-fit"
                        onClick={handleExploreClick}
                      >
                        View feedback
                      </Button>
                    )}
                    {(litmusTestDetails?.status === "submitted" ||
                      litmusTestDetails?.status === "interview cancelled") && (
                      <Button
                        size={"xl"}
                        className="w-full md:w-fit"
                        onClick={handleScheduleInterview}
                        disabled={loading}
                      >
                        Book a Presentation Session
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {!latestCohort?.paymentDetails && (
                <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border">
                  <div className="flex flex-col lg:flex-row gap-2 justify-between items-start lg:items-center">
                    <div className="spcae-y-2">
                      <div className="flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Fee Payment Setup
                        </h2>
                      </div>
                      <p className="sm:w-3/4 text-xs sm:text-base">
                        Kindly setup your fee payment process to access your
                        dashboard.
                      </p>
                    </div>
                    <Button
                      size={"xl"}
                      className="w-full md:w-fit"
                      onClick={handleFeePaymentClick}
                    >
                      Setup Fee Payment
                    </Button>
                  </div>
                </div>
              )}
              {![
                "aadharDocument",
                "secondarySchoolMarksheet",
                "higherSecondaryMarkSheet",
                "higherSecondaryTC",
                "fatherIdProof",
                "motherIdProof",
              ].every((name) =>
                latestCohort?.personalDocs?.documents.some(
                  (doc: any) => doc.name === name
                )
              ) && (
                <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border">
                  <div className="flex flex-col lg:flex-row gap-2 justify-between items-start lg:items-center">
                    <div className="spcae-y-2">
                      <div className="flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Important Documents
                        </h2>
                      </div>
                      <p className="sm:w-7/8 text-xs sm:text-base">
                        Kindly upload your ID and educational documents to
                        complete onboarding.
                      </p>
                    </div>
                    <Button
                      size={"xl"}
                      className="w-full md:w-fit"
                      onClick={handleDocumentsClick}
                    >
                      Setup Documents
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Skeleton className="h-[125px] w-full rounded-xl" />
          )}
          {/* <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border" onClick={handleDocumentClick}>
            <div className="flex justify-between items-center">
              <div className="spcae-y-2">
                <div className="flex sm:flex-row flex-col items-start sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Personal Details</h2>
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
            icon={
              <img
                src="/assets/images/application-documents-icon.svg"
                className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl"
              />
            }
            to="/dashboard/application-documents"
            bgColor="bg-orange-600/10"
            border="border-orange-600"
          />
          <DashboardCard
            title="Fee Payment"
            description="Set up your fee payment process, clear your timely fee instalments and record all your transactions."
            icon={
              <img
                src="/assets/images/fee-payment-icon.svg"
                className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl"
              />
            }
            to="/dashboard/fee-payment"
            bgColor="bg-blue-600/10"
            border="border-blue-600"
          />
          <DashboardCard
            title="Account Details"
            description="Maintain all your profile information along with your passwords."
            icon={
              <img
                src="/assets/images/account-details-icon.svg"
                className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl"
              />
            }
            to="/dashboard/account-details"
            bgColor="bg-[#F8E000]/10"
            border="border-[#F8E000]"
          />
          <DashboardCard
            title="Personal Documents"
            description="Maintain a record of your identification documents. These are mandatory for your course."
            icon={
              <img
                src="/assets/images/personal-documents-icon.svg"
                className="w-16 h-16 sm:w-[120px] sm:h-[120px] text-white rounded-tl-xl sm:rounded-tl-2xl"
              />
            }
            to="/dashboard/personal-documents"
            bgColor="bg-emerald-600/10"
            border="border-emerald-600"
          />
        </div>
      </div>

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-2xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
          <SchedulePresentation
            student={student}
            interviewer={interviewer}
            eventCategory="Litmus Test Interview"
            redirectUrl={`${baseUrl}/dashboard/litmus-task`}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
