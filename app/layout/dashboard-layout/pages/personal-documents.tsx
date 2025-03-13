import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import PersonalDocuments from "../components/PersonalDocuments";

export default function PersonalDocumentsDashboard() {
const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);

  useEffect(() => {
    if(studentData?._id)  {
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
  }, [studentData]);

  return (
  <>
      <div className="flex justify-between items-end p-[52px] bg-[#00CC921A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#00CC92] text-[#00CC92] bg-[#00CC92]/10">
              Personal Documents
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
            <div className="text-2xl">{new Date(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric",})}</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
        Maintain all your personal Identification Documents for this course.
        </p>
      </div>
      <PersonalDocuments student={student} />
  </>
  );
}