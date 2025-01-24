import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import ApplicationDocuments from "~/components/organisms/ApplicationDocuments/ApplicationDocuments";

export default function ApplicationDocumentsDashboard() {
  const { studentData } = useContext(UserContext);
  const [student, setStudent] = useState<any>([]);
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

  return (
  <>
      <div className="flex justify-between items-end p-[52px] bg-[#FF791F1A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
              Application Documents
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            Creator Marketer
            <div className="text-2xl">October, 2024</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
          Access all your submission documents, task reports and personal information forms 
        </p>
      </div>
      <ApplicationDocuments />
  </>
  );
}