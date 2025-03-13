import { Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import LitmusTest from "../components/LitmusTest";

export default function LitmusTask() {
  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);

  useEffect(() => {
    if(studentData?.id)  {
      const fetchStudentData = async () => {
        try {
          const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
          setStudent(student);          
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [studentData?.id]);

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;

  function formatTestDuration(durationDays?: number): string {
    if (durationDays === undefined || durationDays === null) return "00:00:00";
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
  
  return (
  <>
      <div className="flex justify-between items-end p-[52px] bg-[#3698FB1A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
              Litmus Task
            </Badge>
            <Badge className="flex gap-2 items-center bg-black">
              <Clock className="text-[#00A3FF] w-3 h-3"/>
              <div className="text-base font-normal">{formatTestDuration(cohortDetails?.litmusTestDetail[0]?.litmusTestDuration)}</div>
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
            <div className="text-2xl">{new Date(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric",})}</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-[13.67px] ">
          Complete your LITMUS test prior to deadline to avail a scholarship on your fee. This scholarship will be applicable on the last semester fee instalments.
        </p>
      </div>
      <LitmusTest student={student} />
  </>
  );
}