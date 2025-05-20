import { Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import LitmusTest from "../components/LitmusTest";
import { Skeleton } from "~/components/ui/skeleton";

export default function LitmusTask() {
const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>();

  useEffect(() => {
    if(studentData?._id)  {
      const fetchStudentData = async () => {
        try {
          const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
          setStudent(student);   
          console.log("PersonalDocumentsDashboard", student)       
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [studentData?._id]);

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const days = latestCohort?.cohortId?.litmusTestDetail[0]?.litmusTestDuration ?? 0;
    const now = new Date();
    const targetDate = new Date(latestCohort?.tokenFeeDetails?.updatedAt);
    const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
    setRemainingTime(Math.floor((days * 24 * 60 * 60) + diffInSeconds))
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
      return `${String(hrs).padStart(2, '0')}H:${String(mins).padStart(2, '0')}M:${String(secs).padStart(2, '0')}S`;
    } else {
      const days = Math.floor(totalSeconds / (24 * 3600));
      const remainingSeconds = totalSeconds % (24 * 3600);
      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      return `${days}D:${hrs}H:${mins}M`;
    }
  };
  
  return (
  <>
      <div className="py-8 sm:py-[52px] px-[52px] bg-[#3698FB1A] border-b space-y-4 sm:space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
            LITMUS Task
          </Badge>
          {latestCohort?.litmusTestDetails?.status !== 'completed' &&
            <Badge className="flex gap-2 items-center bg-black">
              <Clock className="text-[#00A3FF] w-3 h-3"/>
              <div className="text-base font-normal">{formatHHMMSS(remainingTime)}</div>
            </Badge>
          }
        </div>
        <div className="flex lg:flex-row flex-col gap-2 justify-between items-start lg:items-end">
          <div>
            {student ?
              <h1 className="text-3xl sm:text-4xl font-normal">
                {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
                <div className="text-xl sm:text-2xl">{new Date(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric",})}</div>
              </h1> :
              <div className="space-y-2">
                <Skeleton className="w-[150px] sm:w-[200px] bg-white/10 h-9 " />
                <Skeleton className="w-[300px] sm:w-[250px] bg-white/10 h-6 " />
              </div>
            }
          </div>
          <p className="max-w-[360px] w-full text-sm sm:text-base ">
            Complete your LITMUS test prior to deadline to avail a scholarship on your fee. This scholarship will be applicable on the last semester fee instalments.
          </p>
        </div>
      </div>
      <LitmusTest student={student} />
  </>
  );
}