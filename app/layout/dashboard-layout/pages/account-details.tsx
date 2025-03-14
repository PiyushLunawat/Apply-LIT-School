import { useContext, useEffect, useState } from "react";
import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { Badge } from "~/components/ui/badge";
import AccountDetails from "~/layout/dashboard-layout/components/AccountDetails";


export default function AccountDetailsDashboard() {
  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);
  useEffect(() => {
    if (studentData?._id) {
      const fetchStudentData = async () => {
        try {
          const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
          setStudent(student); // Store the fetched data in state
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [studentData]);

  return (
  <>
      <div className="flex justify-between items-end p-[52px] bg-[#F8E0001A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#F8E000] text-[#F8E000] bg-[#F8E000]/10">
              Application Documents
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
            <div className="text-2xl">{new Date(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric",})}</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
          Maintain all your profile information along with your passwords. 
        </p>
      </div>
      <AccountDetails student={student} />
  </>
  );
}