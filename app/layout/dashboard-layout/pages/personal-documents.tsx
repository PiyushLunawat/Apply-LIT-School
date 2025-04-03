import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import PersonalDocuments from "../components/PersonalDocuments";
import { Skeleton } from "~/components/ui/skeleton";

export default function PersonalDocumentsDashboard() {
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

  return (
  <>
      <div className="py-8 sm:py-[52px] px-[52px] bg-[#00CC921A] border-b space-y-4 sm:space-y-8">
        <Badge className="text-sm border-[#00CC92] text-[#00CC92] bg-[#00CC92]/10">
          Personal Documents
        </Badge>
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
            Maintain all your personal Identification Documents for this course.
          </p>
        </div>
      </div>
      <PersonalDocuments student={student} />
  </>
  );
}