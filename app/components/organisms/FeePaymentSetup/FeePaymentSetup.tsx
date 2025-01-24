"use client";

import { useContext, useEffect, useState } from "react";
import { getCurrentStudent, setupFeePayment, uploadFeeReceipt } from "~/utils/studentAPI"; 
import { UserContext } from "~/context/UserContext";
import { CircleCheck, FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { Badge } from "../../ui/badge";

type FeePaymentData = {
  modeOfPayment: string;
  installmentType: string;
  accountHolderName: string;
  accountNumber: string;
  IFSCCode: string;
  branchName: string;
};

export default function FeePaymentSetup() {
  const { studentData } = useContext(UserContext);

  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInstallment, setExpandedInstallment] = useState<string | null>(null);

  const [formDat, setFormDat] = useState<FeePaymentData>({
    modeOfPayment: "",
    installmentType: "",
    accountHolderName: "",
    accountNumber: "",
    IFSCCode: "",
    branchName: "",
  });

  // Fetch the student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const result = await getCurrentStudent(studentData._id);
        setStudent(result.data);

        // If there's already a feeSetup, skip to step 2
        if (
          result?.data?.cousrseEnrolled?.length > 0 &&
          result.data.cousrseEnrolled[result.data.cousrseEnrolled.length - 1]?.feeSetup
        ) {
          setStep(2);
        }
      } catch (err) {
        console.error("Failed to fetch student data:", err);
      }
    };
    fetchStudentData();
  }, [studentData]);

  // Simple controlled inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDat((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormDat((prev) => ({ ...prev, [name]: value }));
  };

  // Submit step 1
  const handleNext = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Request Body:", formDat);
      const response = await setupFeePayment(formDat);
      console.log("Fee Payment Setup Successful", response);
      setStep(2);
    } catch (err: any) {
      console.error("Error during fee payment setup:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Enable/disable Next button
  const isNextButtonEnabled =
    (formDat.modeOfPayment === "cash" && formDat.installmentType) ||
    (formDat.modeOfPayment === "bank transfer" &&
      formDat.installmentType &&
      formDat.accountHolderName &&
      formDat.accountNumber &&
      formDat.IFSCCode &&
      formDat.branchName);

  // STEP 1: Payment Setup
  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <div className="bg-[#64748B1A] p-6 rounded-xl border mb-8">
          <div className="flex justify-center items-center gap-6">
            <img src="/assets/images/fee-payment-setup-icon.svg" alt="" />
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-xl font-semibold">Fee Payment Setup</h2>
              </div>
              <p className="w-3/4">
                Once you have set up your fee payment method, you will be able
                to access your tracker. Upload your acknowledgment receipts
                to mark a completed payment.
              </p>
            </div>
          </div>
        </div>

        {/* Payment mode & installment type */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="pl-3" htmlFor="modeOfPayment">
              Select Your Mode of Payment
            </Label>
            <Select
              onValueChange={(val) => handleSelectChange("modeOfPayment", val)}
              value={formDat.modeOfPayment}
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

          <div className="flex-1">
            <Label className="pl-3" htmlFor="installmentType">
              Select Installment Type
            </Label>
            <Select
              onValueChange={(val) => handleSelectChange("installmentType", val)}
              value={formDat.installmentType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="one shot payment">One Shot Payment</SelectItem>
                  <SelectItem value="instalments">Instalments</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bank details if 'bank transfer' */}
        {formDat.modeOfPayment === "bank transfer" && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="pl-3" htmlFor="accountHolderName">
                  Account Holder Name
                </Label>
                <Input
                  id="accountHolderName"
                  placeholder="Type here"
                  name="accountHolderName"
                  value={formDat.accountHolderName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label className="pl-3" htmlFor="accountNumber">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="XXXXXXXXXXXX"
                  name="accountNumber"
                  value={formDat.accountNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="pl-3" htmlFor="IFSCCode">
                  IFSC Code
                </Label>
                <Input
                  id="IFSCCode"
                  placeholder="XXXXXXXXXXX"
                  name="IFSCCode"
                  value={formDat.IFSCCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label className="pl-3" htmlFor="branchName">
                  Branch Name
                </Label>
                <Input
                  id="branchName"
                  placeholder="Type here"
                  name="branchName"
                  value={formDat.branchName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        )}

        {formDat.modeOfPayment === "cash" && (
          <p className="text-sm text-gray-500">
            Cash payment does not require additional details.
          </p>
        )}

        {/* Next Button */}
        <Button
          size="xl"
          onClick={handleNext}
          className="mt-4"
          disabled={!isNextButtonEnabled || loading}
        >
          {loading ? "Submitting..." : "Next"}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  };

  // STEP 2: Show installments, file upload, etc.
  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-base text-gray-500">
        Embrace financial flexibility while advancing your education with The LIT
        School's zero-interest instalment plan.<br />
        This plan is meticulously designed to ease the burden of lump-sum payments
        by dividing your course fee into instalments. With no interest applied,
        this option ensures that you can focus on your learning journey without
        financial strain.
      </p>

      <div className="bg-[#64748B1A] p-6 rounded-xl mb-8">
        <div className="flex items-center gap-6">
          <img src="/assets/images/fee-payment-setup-icon.svg" alt="" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">
              You are required to make a total payment of INR 9,95,000.00
            </h2>
            <p>
              Over a course of 9 instalments starting on 12th November, 2025. This
              is inclusive of your scholarship waiver.
            </p>
            <Button variant={"link"} className="w-fit underline !py-0">
              Fee Breakdown
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#64748B1A] p-6 rounded-xl mb-8">
        <div className="flex justify-between">
          <h2 className="flex gap-2.5 text-xl items-center font-semibold">
            <CircleCheck className="w-6 h-6 text-[#00AB7B]" />
            INR 25,000.00
          </h2>
          <div className="flex h-5 items-center space-x-4 text-base">
            <div>Token Amount paid</div>
            <Separator orientation="vertical" />
            <div>{new Date(student?.cousrseEnrolled?.[student.cousrseEnrolled?.length - 1]?.tokenFeeDetails?.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {student?.cousrseEnrolled[student?.cousrseEnrolled?.length - 1]?.feeSetup?.modeOfPayment === "bank transfer" && 
      <div className="p-4 border rounded-xl space-y-4">
        <Badge className="text-sm border-[#3698FB] text-[#3698FB] bg-[#3698FB]/10">
          LIT School Bank Details
        </Badge>
        <p className="pl-3 font-thin">
          Account No: 50200082405270 <br />
          IFSC Code: HDFC0001079 <br />
          Branch: Sadashivnagar
        </p>
      </div>}

      <div className="space-y-4">
        {student?.cousrseEnrolled[student?.cousrseEnrolled?.length - 1]?.installmentDetails.map(
          (sem: any, semIndex: number) => (
            <div key={semIndex} className="border rounded-xl mb-6">
              {/* Semester Header */}
              <div className="flex items-center justify-between text-2xl rounded-t-xl p-6 bg-[#64748B33] font-medium">
                <h3 className="text-lg font-semibold">Semester 0{sem.semester}</h3>
                <h3 className="text-lg font-semibold">
                  ₹
                  {sem.installments
                    .reduce((total: number, inst: any) => total + inst.baseFee, 0)
                    .toLocaleString()}
                  .00
                </h3>
              </div>

              {/* Installments */}
              {sem.installments.map((instal: any, iIndex: number) => {
                const installmentKey = `${semIndex}-${iIndex}`;
                const isExpanded = expandedInstallment === installmentKey;
                const toggleExpand = () => {
                  setExpandedInstallment((prev: any) =>
                    prev === installmentKey ? null : installmentKey
                  );
                };

                return (
                  <div key={iIndex} className="bg-[#64748B1F] p-6 border-b border-gray-700">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={toggleExpand}
                    >
                      <Badge className="bg-[#3698FB]/20 border-[#3698FB] text-base text-white px-4 py-2 ">
                        Installment {iIndex + 1}
                      </Badge>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-right">
                        <Badge className="bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                          ₹{instal.amountPayable.toLocaleString()}
                        </Badge>
                        <Badge className="bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                          Due:{" "}
                          {new Date(instal.installmentDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </Badge>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {instal.feedback && instal.feedback.length > 0 && (
                          <p>
                            <strong>Feedback:</strong> {instal.feedback.join(", ")}
                          </p>
                        )}

                        {instal.receiptUrls && instal.receiptUrls.length > 0 && (
                          <p>
                            <strong>Receipt:</strong>{" "}
                            {instal.receiptUrls.map((url: string, urlIndex: number) => (
                              <a
                                key={urlIndex}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 underline ml-2"
                              >
                                View Receipt {urlIndex + 1}
                              </a>
                            ))}
                          </p>
                        )}

                        {/* Show File Upload + Fee Breakdown */}
                        <FileUploadField
                          semester={sem.semester}
                          installment={iIndex + 1}
                        />

                        <div className="p-3 rounded-lg text-sm text-white/70 space-y-1">
                          <p className="font-medium text-base text-white">Fee Breakdown</p>
                          <div className="flex justify-between">
                            <span>Base Fee</span>
                            <span>
                              ₹
                              {(instal.baseFee + instal.scholarshipAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST</span>
                            <span>
                              ₹{(instal.baseFee * 0.18).toLocaleString()}
                            </span>
                          </div>
                          {instal.scholarshipAmount > 0 && (
                            <div className="flex justify-between text-[#F53F3F]">
                              <span>Scholarship Amount</span>
                              <span>- ₹{instal.scholarshipAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-white/10">
                            <span className="font-medium text-white">Total</span>
                            <span className="font-medium text-white">
                              ₹{instal.amountPayable.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
}

/** 
 * A purely client-side file upload, 
 * calls uploadFeeReceipt on submit 
 */
function FileUploadField({
  semester,
  installment,
}: {
  semester: number;
  installment: number;
}) {
  const [reciptUrl, setReciptUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);
      setReceiptFile(file); // Store the selected file for upload
    }
  };

  const removeFile = (index: number) => {
    setSelectedImage(null); 
    setReceiptFile(null);
  };

  // Actually send the first file to the server
  const handleSubmit = async () => {
    if (!receiptFile) {
      alert('Please upload a receipt image.');
      return;
    }

    console.log("feeee",receiptFile, semester, installment,);

    const formData = new FormData();
    formData.append("recieptImage", receiptFile);
    formData.append("semesterNumber", semester.toString());
    formData.append("installmentNumber", installment.toString());
    
    try {
      const response = await uploadFeeReceipt(formData);
      console.log("Receipt uploaded successfully:", response);
      setReceiptFile(null);
      setError(null);
    } catch (err: any) {
      console.error("Error uploading receipt:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col space-y-3 mt-2 rounded-lg p-4 bg-[#09090B]">
      <h4 className="font-medium text-white">Fee Acknowledgement</h4>

      {/* Display selected files */}
      {/* {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center bg-[#007AFF] h-[52px] text-white p-1.5 rounded-xl w-full"
        >
          <Button size="icon" className="bg-[#3698FB] rounded-xl mr-2">
            <FileTextIcon className="w-5" />
          </Button>
          <span className="flex-1">{file.name}</span>
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              className="bg-[#3698FB] rounded-xl"
              onClick={() => removeFile(index)}
            >
              <XIcon className="w-5" />
            </Button>
          </div>
        </div>
      ))} */}

      {/* File upload input */}
      {selectedImage ? 
      <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[200px]">
      <img
        src={selectedImage}
        alt="Uploaded receipt"
        className="mx-auto h-full object-contain"
      />
    </div> : 
      (<div className="flex items-center justify-between w-full h-16 border-2 border-[#64748B] border-dashed rounded-xl p-1.5">
        <label className="w-full pl-3 text-muted-foreground">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <span className="cursor-pointer">Upload Acknowledgement Receipt</span>
        </label>
        <Button
          className="flex gap-2 text-white px-6 py-6 rounded-xl"
          onClick={() =>
            document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click()
          }
        >
          <UploadIcon className="w-4 h-4" /> Choose
        </Button>
      </div>)}

      <Button size={'xl'} disabled={!receiptFile}
        className="text-white w-fit"
        onClick={handleSubmit}
      >
        Submit
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
