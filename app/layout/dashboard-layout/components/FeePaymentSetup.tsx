"use client";

import { useEffect, useState } from "react";
import { setupFeePayment, uploadFeeReceipt } from "~/utils/studentAPI";
import { AlertCircle, CheckCircle, CircleCheck, Eye, LoaderCircle, PauseCircle, UploadIcon, XIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { Progress } from "~/components/ui/progress";

type FeePaymentData = {
  paymentMethod: string;
  paymentPlan: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    IFSCCode: string;
    branchName: string;
  };
};

interface FeePaymentSetupProps {
  student: any
}

export default function FeePaymentSetup({ student }: FeePaymentSetupProps) {
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const tokenFeeDetails = latestCohort?.tokenFeeDetails;
  
  const [paymentDetails, setPaymentDetails] = useState<any>(latestCohort?.paymentDetails);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInstallment, setExpandedInstallment] = useState<string | null>(null);

  const [formData, setFormData] = useState<FeePaymentData>({
    paymentMethod: "",
    paymentPlan: "",
    bankDetails:{
      accountHolderName: "",
      accountNumber: "",
      IFSCCode: "",
      branchName: "",
    }
  });

  useEffect(() => {
    setPaymentDetails(latestCohort?.paymentDetails);
    console.log("latestCohort?.paymentDetails", latestCohort?.paymentDetails);
    
    if (latestCohort?.paymentDetails?.paymentPlan)
      setStep(2);
  }, [student]);

  const getInstallmentIcon = (verificationStatus: any) => {
    switch (verificationStatus) {
      case 'verifying':
        return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="max-w-[100px] truncate"><PauseCircle className="w-4 h-4 text-[#FEBC10]" /></TooltipTrigger>
            <TooltipContent>
              <p>Verification Pending</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-[#00AB7B]" />;
      case 'flagged':
        return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="max-w-[100px] truncate"><AlertCircle className="w-4 h-4 text-[#F53F3F]" /></TooltipTrigger>
            <TooltipContent>
              <p>Receipt Rejected</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      case 'pending':
      default:
        return null;
    }
  };

  const getStatusColor = (verificationStatus: any) => {
    switch (verificationStatus) {
      case 'verifying':
        return "text-[#FEBC10]";
      case 'paid':
        return "text-[#00AB7B]";
      case 'flagged':
        return "text-[#F53F3F]";
      case 'pending':
      default:
        return null;
    }
  };

  // Simple controlled inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // If the name includes a dot, split it. E.g. "bankDetails.accountHolderName"
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Otherwise set the top-level property
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit step 1
  const handleNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        paymentMethod: formData.paymentMethod,
        paymentPlan: formData.paymentPlan,
      };
  
      // Only include bank details if paymentMethod is "bank transfer"
      if (formData.paymentMethod === "bank transfer") {
        payload.bankDetails = {
          ...formData.bankDetails,
        };
      }

      console.log("Request Body:", payload);
      const response = await setupFeePayment(payload);
      console.log("Fee Payment Setup Successful", response);
      setPaymentDetails(response.data)
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
    (formData.paymentMethod === "cash" && formData.paymentPlan) ||
    (formData.paymentMethod === "bank transfer" &&
      formData.paymentPlan &&
      formData.bankDetails.accountHolderName &&
      formData.bankDetails.accountNumber &&
      formData.bankDetails.IFSCCode &&
      formData.bankDetails.branchName);

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
            <Label className="pl-3" htmlFor="paymentMethod">
              Select Your Mode of Payment
            </Label>
            <Select
              onValueChange={(val) => handleSelectChange("paymentMethod", val)}
              value={formData.paymentMethod}
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
            <Label className="pl-3" htmlFor="paymentPlan">
              Select Installment Type
            </Label>
            <Select
              onValueChange={(val) => handleSelectChange("paymentPlan", val)}
              value={formData.paymentPlan}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="one-shot">One Shot Payment</SelectItem>
                  <SelectItem value="instalments">Instalments</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bank details if 'bank transfer' */}
        {formData.paymentMethod === "bank transfer" && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="pl-3" htmlFor="bankDetails.accountHolderName">
                  Account Holder Name
                </Label>
                <Input
                  id="bankDetails.accountHolderName"
                  placeholder="Type here"
                  name="bankDetails.accountHolderName"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label className="pl-3" htmlFor="accountNumber">
                  Account Number
                </Label>
                <Input
                  id="bankDetails.accountNumber"
                  placeholder="XXXXXXXXXXXX"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
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
                  id="bankDetails.IFSCCode"
                  placeholder="XXXXXXXXXXX"
                  name="bankDetails.IFSCCode"
                  value={formData.bankDetails.IFSCCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label className="pl-3" htmlFor="branchName">
                  Branch Name
                </Label>
                <Input
                  id="bankDetails.branchName"
                  placeholder="Type here"
                  name="bankDetails.branchName"
                  value={formData.bankDetails.branchName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        )}

        {formData.paymentMethod === "cash" && (
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
              Over a course of {Number(cohortDetails?.cohortFeesDetail?.semesters) * Number(cohortDetails?.cohortFeesDetail?.installmentsPerSemester)} instalments
              starting on {new Date(cohortDetails?.startDate).toDateString()}. This
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
            INR {(Number(cohortDetails?.cohortFeesDetail?.tokenFee)).toLocaleString()}
          </h2>
          <div className="flex h-5 items-center space-x-4 text-base">
            <div>Token Amount paid</div>
            <Separator orientation="vertical" />
            <div>{new Date(tokenFeeDetails?.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-xl space-y-4">
        <Badge className="flex gap-2 w-fit text-sm border-[#3698FB] bg-[#3698FB]/10">
          <img src='/assets/images/institute-icon.svg' className='w-4 h-3'/>
          Disruptive Edu Private Limited
        </Badge>
        <p className="pl-3 font-thin">
          Account No: 50200082405270 <br />
          IFSC Code: HDFC0001079 <br />
          Branch: Sadashivnagar
        </p>
      </div>

      {paymentDetails?.paymentPlan === 'one-shot' ? 
      <div className="">
        <div className="border rounded-xl mb-6">
              {/* Semester Header */}
              <div className="flex items-center justify-between text-2xl rounded-t-xl p-6 bg-[#64748B33] font-medium">
                <h3 className="text-lg font-semibold">One Shot Payment</h3>
                <h3 className="text-lg font-semibold">
                  {paymentDetails?.oneShotPayment?.amountPayable !== undefined 
                  ? paymentDetails.oneShotPayment.amountPayable.toLocaleString() 
                  : "N/A"}
                </h3>
              </div>
              
                  <div className="bg-[#64748B1F] p-6 ">
                    <div className="flex justify-between items-center cursor-pointer">
                      <Badge className="flex agp-2 bg-[#3698FB]/20 border-[#3698FB] text-base text-white px-4 py-2 ">
                        Installment 01
                      </Badge>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-right">
                          <Badge className="bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                          Due:{" "}
                          {new Date(paymentDetails?.oneShotPayment?.installmentDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </Badge>
                      </div>
                    </div>

                      <div className="mt-4 space-y-4">
                        {paymentDetails?.oneShotPayment.feedback && paymentDetails?.oneShotPayment.feedback.length > 0 && (
                          <p>
                            <strong>Feedback:</strong> {paymentDetails?.oneShotPayment.feedback.join(", ")}
                          </p>
                        )}

                        {paymentDetails?.oneShotPayment.receiptUrls && paymentDetails?.oneShotPayment.receiptUrls.length > 0 && (
                          <p>
                            <strong>Receipt:</strong>{" "}
                            {paymentDetails?.oneShotPayment.receiptUrls.map((url: string, urlIndex: number) => (
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
                          semester={1}
                          installment={1}
                          studentPaymentId={paymentDetails?._id}
                          onUploadSuccess={(data) => setPaymentDetails(data)}
                        />

                        {/* <div className="p-3 rounded-lg text-sm text-white/70 space-y-1">
                          <p className="font-medium text-base text-white">Fee Breakdown</p>
                          <div className="flex justify-between">
                            <span>Base Fee</span>
                            <span>
                              ₹
                              {(paymentDetails?.oneShotPayment?.amountPayable).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST</span>
                            <span>
                              ₹{(paymentDetails?.oneShotPayment?.amountPayable * 0.18).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#F53F3F]">
                            <span>One Shot Payment Discount</span>
                            <span>
                              - ₹{(paymentDetails?.oneShotPayment?.OneShotPaymentAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#F53F3F]">
                            <span>Scholarship Amount</span>
                            <span>- ₹{(paymentDetails?.oneShotPayment?.amountPayable * 
                              paymentDetails?.semesterFeeDetails?.scholarshipPercentage * 0.01).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/10">
                            <span className="font-medium text-white">Total</span>
                            <span className="font-medium text-white">
                              ₹{paymentDetails?.oneShotPayment?.amountPayable.toLocaleString()}
                            </span>
                          </div>
                        </div> */}
                      </div>
                  </div>
            </div>
      </div> : 
      <div className="space-y-4">
        {paymentDetails?.installments.map(
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
                  <span className="text-muted-foreground">.00</span>
                </h3>
              </div>

              {/* Installments */}
              {sem.installments.map((instalment: any, iIndex: number) => {
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
                      className="flex justify-between items-center cursor-pointer font-medium"
                      onClick={toggleExpand}
                    >
                      <Badge className="flex gap-2 bg-[#3698FB]/20 border-[#3698FB] text-base text-white px-4 py-2 ">
                        {getInstallmentIcon(instalment?.verificationStatus)}
                        Installment 0{iIndex + 1}
                      </Badge>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-right items-center">
                        <Badge className={`${instalment?.verificationStatus === 'paid' ? 'border-[#00CC92] bg-[#00CC92]/10' : 'bg-[#64748B1F]/20 border-[#2C2C2C]'} text-base text-white px-4 py-2`}>
                          ₹{instalment.amountPayable.toLocaleString()}
                        </Badge>
                        {instalment?.verificationStatus === 'paid' ?
                          <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                            <span className="font-light text-[#00CC92]">Paid on</span> {new Date(instalment?.receiptUrls?.[instalment?.receiptUrls.length - 1]?.uploadedAt).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",})}
                          </Badge> :
                        instalment?.verificationStatus === 'verifying' ?
                          <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                            <span className="font-light">Uploaded on</span> {new Date(instalment?.receiptUrls?.[instalment?.receiptUrls.length - 1]?.uploadedAt).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",})}
                          </Badge> :
                        instalment?.verificationStatus === 'flagged' ?
                          <Badge className="flex gap-1 bg-[#F53F3F]/20 border-[#F53F3F] text-base text-white px-4 py-2">
                            <span className="font-light">Pay before</span>  {new Date(instalment?.installmentDate).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",})}
                          </Badge> :
                          <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-base text-white px-4 py-2">
                            <span className="font-light">Due:</span> {new Date(instalment?.installmentDate).toLocaleDateString("en-GB", {day: "2-digit", month: "long", year: "numeric",})}
                          </Badge>
                        }
                        {['verifying', 'paid'].includes(instalment?.verificationStatus) &&
                          <div className="relative group w-10 h-10">
                            <img
                              src={instalment?.receiptUrls?.[instalment?.receiptUrls.length - 1]?.url}
                              alt="Fee_Receipt"
                              className="w-10 h-10 rounded-lg object-contain bg-white py-1"
                            />
                            {/* Eye icon overlay to open modal */}
                            <div
                              className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => setOpen(true)}
                            >
                              <Eye className="text-white w-4 h-4" />
                            </div>
                          </div>
                        }
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {/* {instalment.receiptUrls && instalment.receiptUrls.length > 0 && (
                          <p>
                            <strong>Receipt:</strong>{" "}
                            {instalment.receiptUrls.map((url: string, urlIndex: number) => (
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
                        )} */}

                        {['pending', 'flagged'].includes(instalment.verificationStatus) &&
                        <FileUploadField
                            semester={sem.semester}
                            installment={iIndex + 1}
                            studentPaymentId={paymentDetails?._id}
                            onUploadSuccess={(data) => setPaymentDetails(data)}
                          />
                        }

                        {instalment.history && instalment.history.slice().reverse().map((fleg: any, index: any) => (
                          <div key={index} className="bg-[#09090b] p-3 flex gap-2 items-center">
                            <div className="relative group w-[90px] h-[90px]">
                              <img
                                src={instalment?.receiptUrls?.[instalment.history.length-1 - index]?.url}
                                alt="Fee_Receipt"
                                className="w-[90px] h-[90px] rounded-lg object-contain bg-white py-1"
                              />
                              <div
                                className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => setOpen(true)}
                              >
                                <Eye className="text-white w-7 h-7" />
                              </div>
                            </div>
                            <div className="text-xs">
                              <div className="text-[#F53F3F]">Your previously attached Acknowledgement Receipt has been marked invalid.</div>
                              <div className="mt-1.5">Kindly upload a scanned copy of the receipt issued to you by our fee manager for this specific instalment.</div>
                              <div className="mt-2 text-muted-foreground">Reason: {fleg?.feedback?.[0]}</div>
                            </div>
                          </div>
                    ))}

                        <div className="p-3 rounded-lg text-sm text-white/70 space-y-1">
                          <p className="font-medium text-base text-white">Fee Breakdown</p>
                          <div className="flex justify-between text-sm">
                            <span>Base Fee</span>
                            <span>
                              ₹
                              {(instalment.baseFee + instalment.scholarshipAmount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>GST</span>
                            <span>
                              ₹{(instalment.baseFee * 0.18).toLocaleString()}
                            </span>
                          </div>
                          {instalment.scholarshipAmount > 0 && (
                            <div className="flex justify-between text-[#F53F3F] text-sm">
                              <span>Scholarship Amount</span>
                              <span>- ₹{instalment.scholarshipAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xl pt-1 border-t border-white/10">
                            <span className="font-medium text-white">Total</span>
                            <span className="font-medium text-[#1388FF]">
                              ₹{instalment.amountPayable.toLocaleString()}
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
      </div>}
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
  studentPaymentId,
  onUploadSuccess
}: {
  semester: number;
  installment: number;
  studentPaymentId: any;
  onUploadSuccess: (data: any) => void; 
}) {
  const [reciptUrl, setReciptUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress(0);
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);
      
      const fileKey = generateUniqueFileName(file.name);
    
    setReceiptFile(fileKey);

    const CHUNK_SIZE = 100 * 1024 * 1024;
    event.target.value = "";

    try {
      setUploading(true);
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey);
        console.log("uploadDirect File URL:", fileUrl);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE);
        console.log("uploadMultipart File URL:", fileUrl);
      }
      setReciptUrl(fileUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
    }
  };

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url`, {
      bucketName: "dev-application-portal",
      key: fileKey,
    });
    const { url } = data;
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percentComplete);
      },
    });
    return `${url.split("?")[0]}`;
  };

  const uploadMultipart = async (file: File, fileKey: string, chunkSize: number) => {
    const uniqueKey = fileKey;

    const initiateRes = await axios.post(`https://dev.apply.litschool.in/student/initiate-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
    });
    const { uploadId } = initiateRes.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partRes = await axios.post(`https://dev.apply.litschool.in/student/generate-presigned-url-part`, {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        partNumber: i + 1,
      });
      const { url } = partRes.data;
      const uploadRes = await axios.put(url, chunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (evt: any) => {
          if (!evt.total) return;
          totalBytesUploaded += evt.loaded;
          const percent = Math.round((totalBytesUploaded / file.size) * 100);
          setUploadProgress(Math.min(percent, 100));
        },
      });
      parts.push({ PartNumber: i + 1, ETag: uploadRes.headers.etag });
    }
    await axios.post(`https://dev.apply.litschool.in/student/complete-multipart-upload`, {
      bucketName: "dev-application-portal",
      key: uniqueKey,
      uploadId,
      parts,
    });
    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const removeFile = (index: number) => {
    setSelectedImage(null); 
    setReceiptFile("");
    setReciptUrl("");
  };

  // Actually send the first file to the server
  const handleSubmit = async () => {
    if (!receiptFile) {
      alert('Please upload a receipt image.');
      return;
    }

    const payload = {
      receiptUrl: reciptUrl.toString(),
      semesterNumber: semester.toString(),
      installmentNumber: installment.toString(),
      studentPaymentId: studentPaymentId.toString(),
    };

    console.log("payload", payload);    
    
    try {
      const response = await uploadFeeReceipt(payload);
      console.log("Receipt uploaded successfully:", response);
      onUploadSuccess(response.updatedPayment);

      setReceiptFile("");
      setReciptUrl("");
      setError(null);
    } catch (err: any) {
      console.error("Error uploading receipt:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, '-');
    return `${timestamp}-${sanitizedName}`;
  };  

  return (
    <div className="flex flex-col space-y-3 mt-2 rounded-lg p-4 bg-[#09090B]">
      <div className="flex justify-between items-center px-3">
        <h4 className="font-medium text-white">Fee Acknowledgement</h4>
        {uploading && (
          <div className="">
            <div className="flex items-center gap-2">
              {uploadProgress === 100 ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Progress className="h-2 w-24" value={uploadProgress} />
                  <span>{uploadProgress}%</span>
                </>
              )}
              <Button size="icon" type="button" className="bg-[#3698FB] rounded-xl">
                <XIcon className="w-5" />
              </Button>
            </div>
          </div>
          )}
      </div>

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

      <Button size={'xl'} disabled={uploading}
        className="text-white w-fit"
        onClick={handleSubmit}
      >
        Submit
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
