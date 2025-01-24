import { getCurrentStudent } from "~/utils/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import FeePaymentSetup from "~/components/organisms/FeePaymentSetup/FeePaymentSetup";

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

  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Summary
  const [formData, setFormData] = useState<FeePaymentData>({
    paymentMode: "",
    installmentType: "",
    accountHolderName: "",
    accountNo: "",
    ifscCode: "",
    branchName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => setStep(2);

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
            Creator Marketer
            <div className="text-2xl">October, 2024</div>
          </h1>
        </div>
        <p className="max-w-[360px] w-full text-base ">
          Set up your fee payment process, clear your timely fee instalments and record all your transactions.
        </p>
      </div>
      <FeePaymentSetup/>
  </>
  );
}