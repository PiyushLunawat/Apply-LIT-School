import Header from "../../../components/organisms/Header/Header";
import Sidebar from "../../../components/organisms/Sidebar/Sidebar";
import { Badge } from "../../../components/ui/badge";
import FeePaymentSetup from "../components/FeePaymentSetup";
import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";

type FeePaymentData = {
    paymentMode: string;
    installmentType: string;
    accountHolderName: string;
    accountNo: string;
    ifscCode: string;
    branchName: string;
  };


export default function FeePaymentSetupDashboard() {
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
      <div className="flex justify-between items-end p-[52px] bg-[#3698FB1A] border-b">
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
              Fee Payment
            </Badge>
          </div>
          <h1 className="text-4xl font-normal">
            {student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
            <div className="text-2xl">{new Date(student?.appliedCohorts?.[student?.appliedCohorts.length - 1]?.cohortId?.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric",})}</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
          Set up your fee payment process, clear your timely fee instalments and record all your transactions.
        </p>
      </div>
      <FeePaymentSetup student={student}/>
  </>
  );
}