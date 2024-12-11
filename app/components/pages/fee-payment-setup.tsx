import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Badge } from "../ui/badge";
import { useState } from "react";
import FeePaymentSetup from "../organisms/FeePaymentSetup/FeePaymentSetup";

type FeePaymentData = {
    paymentMode: string;
    installmentType: string;
    accountHolderName: string;
    accountNo: string;
    ifscCode: string;
    branchName: string;
  };


export default function FeePaymentSetupDashboard() {
  const user = {
    name: "John Walker",
    school: "LIT School"
  };
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
  <Header subtitle={false} classn="" />
  <div className="flex">
    <Sidebar user={user}/>
    <div className="w-full overflow-y-auto" style={{ height: `calc(100vh - 52px)`}}>
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

    </div>
    </div>
  </>
  );
}