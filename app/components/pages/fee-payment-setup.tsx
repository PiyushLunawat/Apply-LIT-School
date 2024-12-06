import ApplicationHome from "~/components/pages/application";
import { Link } from "@remix-run/react";
import { CheckCircle, CircleCheck, Clock, ClockArrowUp, FileText, FolderClosed, ReceiptIndianRupee, UserIcon } from "lucide-react";
import Header from "../organisms/Header/Header";
import Sidebar from "../organisms/Sidebar/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import LITMUSTest from "../organisms/LITMUSTest/LITMUSTest";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

type FeePaymentData = {
    paymentMode: string;
    installmentType: string;
    accountHolderName: string;
    accountNo: string;
    ifscCode: string;
    branchName: string;
  };


export default function FeePaymentSetup() {
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
      <div className="p-8">
      {step === 1 && (
        <div className="space-y-4">
          
      <div className="bg-[#64748B1A] p-6 rounded-xl border mb-8 ">
        <div className="flex justify-center items-center gap-6">
            <img src="/assets/images/fee-payment-setup-icon.svg" className=""/>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-semibold">Fee Payment Setup</h2>
            </div>
            <p className="w-3/4">
            Once you have set up your fee payment method, you will be able to
            access your tracker. Upload your acknowledgment receipts to mark a
            completed payment.
            </p>
          </div>
        </div>
      </div> 
       <div className="flex gap-2">
        <div className="flex-1">
          <Label className="pl-3" htmlFor="paymentMode">Select Your Mode of Payment</Label>
          <Select
            onValueChange={(value) => handleSelectChange("paymentMode", value)}
            value={formData.paymentMode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
         {/* Select Installment Type */}
         <div className="flex-1">
              <Label className="pl-3" htmlFor="installmentType">Select Installment Type</Label>
              <Select
                onValueChange={(value) => handleSelectChange("installmentType", value)}
                value={formData.installmentType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="one-shot-payment">One Shot Payment</SelectItem>
                    <SelectItem value="installments">Installments</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
        </div>

        {formData.paymentMode === "bank transfer" && (
          <>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="pl-3" htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                placeholder="Type here"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex-1">
              <Label className="pl-3" htmlFor="accountNo">Account Number</Label>
              <Input
                id="accountNo"
                placeholder="XXXXXXXXXXXX"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="pl-3" htmlFor="ifscCode">IFS Code</Label>
              <Input
                id="ifscCode"
                placeholder="XXXXXXXXXXX"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex-1">
              <Label className="pl-3" htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                placeholder="Type here"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
              />
            </div>
          </div>  
          </>
        )}

        {formData.paymentMode === "cash" && (
          <p className="text-sm text-gray-500">
            Cash payment does not require additional details. Please click "Next" to proceed.
          </p>
        )}

        {/* Next Button */}
        <Button size='xl' onClick={handleNext} className="mt-4">
          Next
        </Button>
      </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-base text-gray-500">
          Embrace financial flexibility while advancing your education with The LIT School's zero-interest instalment plan.<br/>
          This plan is meticulously designed to ease the burden of lump-sum payments by dividing your course fee into instalments. With no interest applied, this option ensures that you can focus on your learning journey without financial strain.
          </p>

          <div className="bg-[#64748B1A] p-6 rounded-xl mb-8 ">
        <div className="flex items-center gap-6">
            <img src="/assets/images/fee-payment-setup-icon.svg" className=""/>
          <div className="flex justify-start flex-col gap-1">
            <h2 className="text-xl font-semibold">You are required to make a total payment of INR 9,95,000.00</h2>
            <p className="">
            Over a course of 9 instalments starting on 12th November, 2025. This is inclusive of your scholarship waiver.
            </p>
            <Button variant={'link'} className="w-fit underline !py-0">Fee Breakdown</Button>
          </div>
        </div>
      </div> 

      <div className="bg-[#64748B1A] p-6 rounded-xl mb-8 ">
        <div className="flex justify-start flex-col gap-2">
          <h2 className="flex gap-2.5 text-xl font-semibold">
            <CircleCheck className="w-6 h-6 text-[#00AB7B]"/>
            INR 25,000.00
          </h2>
          <div className="flex h-5 items-center space-x-4 text-base">
            <div>Token Amount paid</div>
            <Separator orientation="vertical" />
            <div>3 Nov, 2024</div> 
          </div>
        </div>
      </div> 

      <div className="p-4 border rounded-xl space-y-4">
        <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
          LIT School Bank Details
        </Badge>
        <p className="pl-3 font-thin">
          Account No: XXXXXXXX <br />
          IFSC Code: XXXXXXXXX <br />
          Branch: Sadashivnagar
        </p>
      </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Semester 1 - ₹2,81,700</h3>
            <div className="space-y-2">
              <p>
                <strong>Instalment 01:</strong> ₹1,12,680 (Due: 10th Sep 2024)
              </p>
              <Input
                type="file"
                id="Upload Acknowledgment Receipt"
                className="mt-2"
              />
              <Button>Submit</Button>
            </div>
          </div>

          <Button className="mt-4" onClick={() => setStep(1)}>
            Back
          </Button>
        </div>
      )}
    </div>

    </div>
    </div>
  </>
  );
}