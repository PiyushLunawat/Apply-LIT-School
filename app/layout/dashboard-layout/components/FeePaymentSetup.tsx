/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  CircleCheck,
  Eye,
  LoaderCircle,
  PauseCircle,
  UploadIcon,
  X,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { setupFeePayment, uploadFeeReceipt } from "~/api/studentAPI";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "../../../components/ui/badge";
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
import { Separator } from "../../../components/ui/separator";

import { S3Client } from "@aws-sdk/client-s3";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";

const s3Client = new S3Client({});

const formatAmount = (value: number | undefined) =>
  value !== undefined
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Math.round(value)
      )
    : "--";

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
  student: any;
}

export default function FeePaymentSetup({ student }: FeePaymentSetupProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const tokenFeeDetails = latestCohort?.tokenFeeDetails;
  const litmusTestDetails = latestCohort?.litmusTestDetails;

  const [paymentDetails, setPaymentDetails] = useState<any>(
    latestCohort?.paymentDetails
  );

  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInstallment, setExpandedInstallment] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<FeePaymentData>({
    paymentMethod: "",
    paymentPlan: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      IFSCCode: "",
      branchName: "",
    },
  });

  useEffect(() => {
    setPaymentDetails(latestCohort?.paymentDetails);
    console.log("latestCohort?.paymentDetails", latestCohort?.paymentDetails);

    if (latestCohort?.paymentDetails?.paymentPlan) setStep(2);
  }, [student]);

  const getInstallmentIcon = (verificationStatus: any) => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="max-w-[100px] truncate">
                <PauseCircle className="w-4 h-4 text-[#FEBC10]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Verification Pending</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "paid":
        return <CheckCircle className="w-4 h-4 text-[#00AB7B]" />;
      case "flagged":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="max-w-[100px] truncate">
                <AlertCircle className="w-4 h-4 text-[#F53F3F]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Receipt Rejected</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "pending":
      default:
        return null;
    }
  };

  const getStatusColor = (verificationStatus: any) => {
    switch (verificationStatus) {
      case "verifying":
        return "text-[#FEBC10]";
      case "paid":
        return "text-[#00AB7B]";
      case "flagged":
        return "text-[#F53F3F]";
      case "pending":
      default:
        return null;
    }
  };

  // Simple controlled inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // Apply specific restrictions based on input name
    if (name === "bankDetails.accountHolderName") {
      newValue = newValue.replace(/[^a-zA-Z\s]/g, ""); // only letters and spaces
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    if (name === "bankDetails.accountNumber") {
      newValue = newValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 17); // uppercase alphanumeric only
    }

    if (name === "bankDetails.IFSCCode") {
      newValue = newValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11); // uppercase, no spaces, max 11 chars
    }

    // Now set state properly
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: newValue,
        },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: newValue }));
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
      setPaymentDetails(response.data);
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

  const handleViewReciept = (url: string) => {
    setReceipt(url);
    setOpen(true);
  };

  const handleFileDownload = async (url: string, docName: string) => {
    setDownloading(true);
    try {
      // 1. Fetch the file as Blob
      const response = await fetch(url);
      const blob = await response.blob();

      // 2. Create a temporary object URL for that Blob
      const blobUrl = URL.createObjectURL(blob);

      // 3. Create a hidden <a> and force download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${docName}.png`; // or "myImage.png"
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  let lastStatus = "";

  function groupInstallmentsBySemester(installments: any[] = []): any[][] {
    const grouped = installments.reduce((acc, installment) => {
      const semester = installment.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(installment);
      return acc;
    }, {} as Record<number, any[]>);

    return Object.values(grouped);
  }

  const groupedInstallments = groupInstallmentsBySemester(
    paymentDetails?.installments
  );
  // console.log(groupedInstallments);

  // STEP 1: Payment Setup
  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl border mb-8">
          <div className="flex justify-center items-center gap-6">
            <img
              src="/assets/images/fee-payment-setup-icon.svg"
              alt=""
              className="hidden sm:block"
            />
            <div>
              <div className="flex items-center gap-4 mb-2">
                <img
                  src="/assets/images/fee-payment-setup-icon.svg"
                  alt=""
                  className="sm:hidden"
                />
                <h2 className="text-xl font-semibold">Fee Payment Setup</h2>
              </div>
              <p className="w-3/4 text-sm sm:text-base">
                Once you have set up your fee payment method, you will be able
                to access your tracker. Upload your acknowledgment receipts to
                mark a completed payment.
              </p>
            </div>
          </div>
        </div>

        {!student ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-[72px] rounded-xl" />
            <Skeleton className="w-full h-[172px] rounded-xl" />
          </div>
        ) : (
          <>
            {/* Payment mode & installment type */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-2">
              <div className="space-y-2 flex-1">
                <Label className="pl-3" htmlFor="paymentMethod">
                  Select Your Mode of Payment
                </Label>
                <Select
                  onValueChange={(val) =>
                    handleSelectChange("paymentMethod", val)
                  }
                  value={formData.paymentMethod}
                >
                  <SelectTrigger
                    className={`w-full ${
                      formData.paymentMethod
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="bank transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1">
                <Label className="pl-3" htmlFor="paymentPlan">
                  Select Installment Type
                </Label>
                <Select
                  onValueChange={(val) =>
                    handleSelectChange("paymentPlan", val)
                  }
                  value={formData.paymentPlan}
                >
                  <SelectTrigger
                    className={`w-full ${
                      formData.paymentPlan
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
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
                <div className="flex flex-col md:flex-row gap-4 md:gap-2">
                  <div className="space-y-2 flex-1">
                    <Label
                      className="pl-3"
                      htmlFor="bankDetails.accountHolderName"
                    >
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
                  <div className="space-y-2 flex-1">
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
                <div className="flex flex-col md:flex-row gap-4 md:gap-2">
                  <div className="space-y-2 flex-1">
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
                  <div className="space-y-2 flex-1">
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
              disabled={loading}
            >
              {loading ? "Submitting..." : "Next"}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </>
        )}
      </div>
    );
  };

  // STEP 2: Show installments, file upload, etc.
  const renderStep2 = () => (
    <div className="space-y-4">
      <p className="text-xs sm:text-base text-gray-500">
        Embrace financial flexibility while advancing your education with The
        LIT School's zero-interest instalment plan.
        <br />
        This plan is meticulously designed to ease the burden of lump-sum
        payments by dividing your course fee into instalments. With no interest
        applied, this option ensures that you can focus on your learning journey
        without financial strain.
      </p>

      <div className="bg-[#64748B1A] p-4 sm:p-6 rounded-xl mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/assets/images/fee-payment-setup-icon.svg"
            alt=""
            className="hidden sm:block"
          />
          <div className="flex flex-col gap-2 sm:gap-1">
            <div className="flex items-center gap-4">
              <img
                src="/assets/images/fee-payment-setup-icon.svg"
                alt=""
                className="sm:hidden"
              />
              <h2 className="text-lg sm:text-xl font-semibold">
                You are required to make a total payment of INR{" "}
                {paymentDetails?.paymentPlan === "one-shot"
                  ? `${formatAmount(
                      paymentDetails.oneShotPayment.amountPayable
                    )}`
                  : `${formatAmount(
                      paymentDetails?.installments.reduce(
                        (total: number, inst: any) =>
                          total + inst.amountPayable,
                        0
                      )
                    )}`}
                .00
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Over a course of{" "}
              {paymentDetails?.paymentPlan === "one-shot"
                ? `1`
                : `${
                    Number(cohortDetails?.cohortFeesDetail?.semesters) *
                    Number(
                      cohortDetails?.cohortFeesDetail?.installmentsPerSemester
                    )
                  }`}{" "}
              instalments starting on{" "}
              {new Date(cohortDetails?.startDate).toDateString()}. This is
              inclusive of your scholarship waiver.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between items-center bg-[#64748B1A] p-4 sm:p-6 rounded-xl mb-8">
        <div className="flex flex-col flex-1 sm:flex-row sm:gap-2 sm:justify-between items-start sm:items-center">
          <h2 className="flex gap-2.5 text-lg sm:text-xl items-center font-semibold">
            <CircleCheck className="w-4 sm:w-6 h-4 sm:h-6 text-[#00AB7B]" />
            INR {formatAmount(cohortDetails?.cohortFeesDetail?.tokenFee)}
          </h2>
          <div className="flex h-5 items-center gap-2 text-sm sm:text-base">
            <div>Admission Fee paid</div>
            <Separator orientation="vertical" />
            <div>
              {new Date(tokenFeeDetails?.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="relative group w-10 h-10">
          <img
            src={`${process.env.NEXT_PUBLIC_AWS_RESOURCE_URL}/${
              tokenFeeDetails?.receipts?.[tokenFeeDetails?.receipts.length - 1]
                ?.url
            }`}
            alt="Fee_Receipt"
            className="w-10 h-10 rounded-lg object-contain bg-white py-1"
          />
          {/* Eye icon overlay to open modal */}
          <div
            className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() =>
              handleViewReciept(
                `${process.env.NEXT_PUBLIC_AWS_RESOURCE_URL}/${
                  tokenFeeDetails?.receipts?.[
                    tokenFeeDetails?.receipts.length - 1
                  ]?.url
                }`
              )
            }
          >
            <Eye className="text-white w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-xl space-y-2 sm:space-y-4">
        <Badge className="flex gap-2 w-fit text-sm border-[#3698FB] bg-[#3698FB]/10">
          <img src="/assets/images/institute-icon.svg" className="w-4 h-3" />
          Disruptive Edu Private Limited
        </Badge>
        <p className="pl-3 font-thin text-sm sm:text-base">
          Account No: 50200082405270 <br />
          IFSC Code: HDFC0001079 <br />
          Branch: Sadashivnagar
        </p>
      </div>

      {paymentDetails?.paymentPlan === "one-shot" ? (
        <div className="">
          <div className="border rounded-xl mb-6">
            {/* Semester Header */}
            <div className="flex items-center justify-between text-2xl rounded-t-xl p-6 bg-[#64748B33] font-medium">
              <h3 className="text-lg font-semibold">One Shot Payment</h3>
              <h3 className="text-lg font-semibold">
                ₹
                {paymentDetails?.oneShotPayment?.amountPayable !== undefined
                  ? formatAmount(paymentDetails.oneShotPayment.amountPayable)
                  : "N/A"}
              </h3>
            </div>
            <div className="bg-[#64748B1F] p-4 sm:p-6 ">
              <div className="flex justify-end items-center cursor-pointer">
                {/* <Badge className="flex w-fit gap-2 bg-[#3698FB]/20 border-[#3698FB] text-base text-white px-4 py-2 ">
                {getInstallmentIcon(paymentDetails?.oneShotPayment?.verificationStatus)}
                Installment 01
              </Badge> */}
                <div className="flex flex-col sm:flex-row sm:gap-4 text-right">
                  <Badge
                    className={`${
                      paymentDetails?.oneShotPayment?.verificationStatus ===
                      "paid"
                        ? "border-[#00CC92] bg-[#00CC92]/10"
                        : "bg-[#64748B1F]/20 border-[#2C2C2C]"
                    } text-sm sm:text-base text-white px-4 py-2`}
                  >
                    ₹
                    {formatAmount(
                      paymentDetails?.oneShotPayment?.amountPayable
                    )}
                  </Badge>
                  {paymentDetails?.oneShotPayment?.verificationStatus ===
                  "paid" ? (
                    <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                      <span className="font-light text-[#00CC92]">Paid on</span>{" "}
                      {new Date(
                        paymentDetails?.oneShotPayment?.receiptUrls?.[
                          paymentDetails?.oneShotPayment?.receiptUrls.length - 1
                        ]?.uploadedAt
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Badge>
                  ) : paymentDetails?.oneShotPayment?.verificationStatus ===
                    "verifying" ? (
                    <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                      <span className="font-light">Uploaded on</span>{" "}
                      {new Date(
                        paymentDetails?.oneShotPayment?.receiptUrls?.[
                          paymentDetails?.oneShotPayment?.receiptUrls.length - 1
                        ]?.uploadedAt
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Badge>
                  ) : paymentDetails?.oneShotPayment?.verificationStatus ===
                    "flagged" ? (
                    <Badge className="flex gap-1 bg-[#F53F3F]/20 border-[#F53F3F] text-sm sm:text-base text-white px-4 py-2">
                      <span className="font-light">Pay before</span>{" "}
                      {new Date(
                        paymentDetails?.oneShotPayment?.installmentDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Badge>
                  ) : (
                    <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                      <span className="font-light">Due:</span>{" "}
                      {new Date(
                        paymentDetails?.oneShotPayment?.installmentDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Badge>
                  )}
                  {["verifying", "paid"].includes(
                    paymentDetails?.oneShotPayment?.verificationStatus
                  ) && (
                    <div className="relative group w-10 h-10">
                      <img
                        src={`${process.env.NEXT_PUBLIC_AWS_RESOURCE_URL}/${
                          paymentDetails?.oneShotPayment?.receiptUrls?.[
                            paymentDetails?.oneShotPayment?.receiptUrls.length -
                              1
                          ]?.url
                        }`}
                        alt="Fee_Receipt"
                        className="w-10 h-10 rounded-lg object-contain bg-white py-1"
                      />
                      {/* Eye icon overlay to open modal */}
                      <div
                        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() =>
                          handleViewReciept(
                            paymentDetails?.oneShotPayment?.receiptUrls?.[
                              paymentDetails?.oneShotPayment?.receiptUrls
                                .length - 1
                            ]?.url
                          )
                        }
                      >
                        <Eye className="text-white w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {/* Show File Upload + Fee Breakdown */}
                {lastStatus !== "pending" &&
                  ["pending", "flagged"].includes(
                    paymentDetails?.oneShotPayment?.verificationStatus
                  ) && (
                    <FileUploadField
                      oneShot={true}
                      studentPaymentId={paymentDetails?.oneShotPayment?._id}
                      onUploadSuccess={(data) => setPaymentDetails(data)}
                    />
                  )}
                {paymentDetails?.oneShotPayment.feedback &&
                  paymentDetails?.oneShotPayment.feedback
                    .slice()
                    .reverse()
                    .map((flag: any, index: any) => (
                      <div
                        key={index}
                        className="bg-[#09090b] p-3 flex flex-col gap-1 items-center"
                      >
                        <div className="flex gap-2 items-center">
                          <div className="relative group w-[90px] h-[90px]">
                            <img
                              src={`${
                                process.env.NEXT_PUBLIC_AWS_RESOURCE_URL
                              }/${
                                paymentDetails?.oneShotPayment?.receiptUrls?.[
                                  paymentDetails?.oneShotPayment.feedback
                                    .length -
                                    1 -
                                    index
                                ]?.url
                              }
                              `}
                              alt="Fee_Receipt"
                              className="w-[90px] h-[90px] rounded-lg object-contain bg-white py-1"
                            />
                            <div
                              className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() =>
                                handleViewReciept(
                                  `${
                                    process.env.NEXT_PUBLIC_AWS_RESOURCE_URL
                                  }/${
                                    paymentDetails?.oneShotPayment
                                      ?.receiptUrls?.[
                                      paymentDetails?.oneShotPayment.feedback
                                        .length -
                                        1 -
                                        index
                                    ]?.url
                                  }`
                                )
                              }
                            >
                              <Eye className="text-white w-7 h-7" />
                            </div>
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="text-[#F53F3F]">
                              Your previously attached Acknowledgement Receipt
                              has been marked invalid.
                            </div>
                            <div className="mt-1.5">
                              Kindly upload a scanned copy of the receipt issued
                              to you by our fee manager for this specific
                              instalment.
                            </div>
                            <div className="hidden sm:block mt-2 text-muted-foreground">
                              Reason: {flag?.feedbackData?.[0]}
                            </div>
                          </div>
                        </div>
                        <div className="sm:hidden mt-2 text-xs text-muted-foreground">
                          Reason: {flag?.feedbackData?.[0]}
                        </div>
                      </div>
                    ))}

                <div className="p-3 rounded-lg space-y-1 sm:space-y-3">
                  <p className="font-medium text-base text-white">
                    Fee Breakdown
                  </p>
                  <div className="text-sm text-white/70 space-y-0 sm:space-y-1.5">
                    <div className="flex justify-between">
                      <span>Base Fee</span>
                      <span>₹{formatAmount(cohortDetails?.baseFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST</span>
                      <span>
                        ₹{formatAmount(cohortDetails?.baseFee * 0.18)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#F53F3F]">
                      <span>One Shot Payment Discount</span>
                      <span>
                        - ₹
                        {formatAmount(
                          litmusTestDetails?.scholarshipDetail
                            ?.oneShotPaymentDetails?.OneShotPaymentAmount
                        )}
                      </span>
                    </div>
                    {litmusTestDetails?.scholarshipDetail && (
                      <div className="flex justify-between text-[#F53F3F]">
                        <span>Scholarship Amount</span>
                        <span>
                          - ₹
                          {formatAmount(
                            cohortDetails?.baseFee *
                              1.18 *
                              litmusTestDetails?.scholarshipDetail
                                ?.scholarshipPercentage *
                              0.01
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl pt-1">
                    <span className="font-medium text-white">Total</span>
                    <span className="font-medium text-[#1388FF]">
                      ₹
                      {formatAmount(
                        litmusTestDetails?.scholarshipDetail
                          ?.oneShotPaymentDetails?.amountPayable
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInstallments)?.map(
            ([semester, installments], semIndex) => {
              // Determine semester status
              const allPending = installments.every(
                (inst: any) => inst.verificationStatus === "pending"
              );
              const allPaid = installments.every(
                (inst: any) => inst.verificationStatus === "paid"
              );
              const semStatus = allPending
                ? "pending"
                : allPaid
                ? "paid"
                : "verifying";

              return (
                <div key={semIndex} className="border rounded-xl mb-6">
                  {/* Semester Header */}
                  <div className="flex items-center justify-between text-2xl rounded-t-xl p-4 sm:p-6 bg-[#64748B33] font-medium">
                    <div className="flex gap-2">
                      {getInstallmentIcon(semStatus)}
                      <h3 className="text-lg font-semibold">
                        Semester 0{semIndex + 1}
                      </h3>
                    </div>
                    <h3 className="text-lg font-semibold">
                      ₹
                      {formatAmount(
                        installments.reduce(
                          (total: number, inst: any) =>
                            total + inst.amountPayable,
                          0
                        )
                      )}
                      <span className="text-muted-foreground">.00</span>
                    </h3>
                  </div>

                  {/* Installments */}
                  {installments.map((instalment: any, iIndex: number) => {
                    const installmentKey = `${semIndex}-${iIndex}`;
                    const isExpanded = expandedInstallment === installmentKey;
                    const toggleExpand = () => {
                      setExpandedInstallment((prev: any) =>
                        prev === installmentKey ? null : installmentKey
                      );
                    };
                    return (
                      <div
                        key={iIndex}
                        className={`bg-[#64748B1F] p-4 sm:p-6 ${
                          iIndex === installments.length - 1
                            ? "rounded-b-xl"
                            : "border-b border-gray-700"
                        }`}
                      >
                        <div
                          className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center cursor-pointer font-medium"
                          onClick={toggleExpand}
                        >
                          <Badge className="flex w-fit gap-2 bg-[#3698FB]/20 border-[#3698FB] text-base text-white px-4 py-2 ">
                            {getInstallmentIcon(instalment?.verificationStatus)}
                            Installment 0{iIndex + 1}
                          </Badge>
                          <div className="flex gap-2 sm:gap-4 text-right sm:items-center">
                            <Badge
                              className={`${
                                instalment?.verificationStatus === "paid"
                                  ? "border-[#00CC92] bg-[#00CC92]/10"
                                  : "bg-[#64748B1F]/20 border-[#2C2C2C]"
                              } text-sm sm:text-base text-white px-4 py-2`}
                            >
                              ₹{formatAmount(instalment?.amountPayable)}
                            </Badge>
                            {instalment?.verificationStatus === "paid" ? (
                              <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                                <span className="font-light text-[#00CC92]">
                                  Paid on
                                </span>{" "}
                                {new Date(
                                  instalment?.receiptUrls?.[
                                    instalment?.receiptUrls.length - 1
                                  ]?.uploadedAt
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Badge>
                            ) : instalment?.verificationStatus ===
                              "verifying" ? (
                              <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                                <span className="font-light">Uploaded on</span>{" "}
                                {new Date(
                                  instalment?.receiptUrls?.[
                                    instalment?.receiptUrls.length - 1
                                  ]?.uploadedAt
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Badge>
                            ) : instalment?.verificationStatus === "flagged" ? (
                              <Badge className="flex gap-1 bg-[#F53F3F]/20 border-[#F53F3F] text-sm sm:text-base text-white px-4 py-2">
                                <span className="font-light">Pay before</span>{" "}
                                {new Date(
                                  instalment?.installmentDate
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Badge>
                            ) : (
                              <Badge className="flex gap-1 bg-[#64748B1F]/20 border-[#2C2C2C] text-sm sm:text-base text-white px-4 py-2">
                                <span className="font-light">Due:</span>{" "}
                                {new Date(
                                  instalment?.installmentDate
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Badge>
                            )}
                            {["verifying", "paid"].includes(
                              instalment?.verificationStatus
                            ) && (
                              <div className="relative group w-10 h-10">
                                <img
                                  src={`${
                                    process.env.NEXT_PUBLIC_AWS_RESOURCE_URL
                                  }/${
                                    instalment?.receiptUrls?.[
                                      instalment?.receiptUrls.length - 1
                                    ]?.url
                                  }`}
                                  alt="Fee_Receipt"
                                  className="w-10 h-10 rounded-lg object-contain bg-white py-1"
                                />
                                {/* Eye icon overlay to open modal */}
                                <div
                                  className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() =>
                                    handleViewReciept(
                                      `${
                                        process.env.NEXT_PUBLIC_AWS_RESOURCE_URL
                                      }/${
                                        instalment?.receiptUrls?.[
                                          instalment?.receiptUrls.length - 1
                                        ]?.url
                                      }`
                                    )
                                  }
                                >
                                  <Eye className="text-white w-4 h-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            {lastStatus !== "pending" &&
                              ["pending", "flagged"].includes(
                                instalment.verificationStatus
                              ) && (
                                <FileUploadField
                                  semester={instalment?.semester}
                                  installment={instalment?.installmentNumber}
                                  oneShot={false}
                                  studentPaymentId={instalment?._id}
                                  onUploadSuccess={(data) =>
                                    setPaymentDetails(data)
                                  }
                                />
                              )}

                            {instalment.feedback &&
                              instalment.feedback
                                .slice()
                                .reverse()
                                .map((flag: any, index: any) => (
                                  <div
                                    key={index}
                                    className="bg-[#09090b] p-3 flex gap-1 items-center"
                                  >
                                    <div className="flex gap-2 items-center">
                                      <div className="relative group w-[90px] h-[90px]">
                                        <img
                                          src={`${
                                            process.env
                                              .NEXT_PUBLIC_AWS_RESOURCE_URL
                                          }/${
                                            instalment?.receiptUrls?.[
                                              instalment.feedback.length -
                                                1 -
                                                index
                                            ]?.url
                                          }`}
                                          alt="Fee_Receipt"
                                          className="w-[90px] h-[90px] rounded-lg object-contain bg-white py-1"
                                        />
                                        <div
                                          className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                          onClick={() =>
                                            handleViewReciept(
                                              `${
                                                process.env
                                                  .NEXT_PUBLIC_AWS_RESOURCE_URL
                                              }/${
                                                instalment?.receiptUrls?.[
                                                  instalment.feedback.length -
                                                    1 -
                                                    index
                                                ]?.url
                                              }`
                                            )
                                          }
                                        >
                                          <Eye className="text-white w-7 h-7" />
                                        </div>
                                      </div>
                                      <div className="text-xs">
                                        <div className="text-[#F53F3F]">
                                          Your previously attached
                                          Acknowledgement Receipt has been
                                          marked invalid.
                                        </div>
                                        <div className="mt-1.5">
                                          Kindly upload a scanned copy of the
                                          receipt issued to you by our fee
                                          manager for this specific instalment.
                                        </div>
                                        <div className="hidden sm:block mt-2 text-muted-foreground">
                                          Reason: {flag?.feedbackData?.[0]}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="sm:hidden text-xs mt-2 text-muted-foreground">
                                      Reason: {flag?.feedbackData?.[0]}
                                    </div>
                                  </div>
                                ))}

                            <div className="p-3 rounded-lg space-y-1 sm:space-y-3">
                              <p className="font-medium text-base text-white">
                                Fee Breakdown
                              </p>
                              <div className="text-sm text-white/70 space-y-0 sm:space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span>Base Fee</span>
                                  <span>
                                    ₹
                                    {formatAmount(
                                      instalment?.baseFee +
                                        instalment?.scholarshipAmount
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>GST</span>
                                  <span>
                                    ₹{formatAmount(instalment?.baseFee * 0.18)}
                                  </span>
                                </div>
                                {instalment.scholarshipAmount > 0 && (
                                  <div className="flex justify-between text-[#F53F3F] text-sm">
                                    <span>Scholarship Amount</span>
                                    <span>
                                      - ₹
                                      {formatAmount(
                                        instalment?.scholarshipAmount
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between text-lg sm:text-xl pt-1">
                                <span className="font-medium text-white">
                                  Total
                                </span>
                                <span className="font-medium text-[#1388FF]">
                                  ₹{formatAmount(instalment?.amountPayable)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="hidden">
                          {(lastStatus = instalment.verificationStatus)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
          )}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="relative bg-[#64748B33] border border-[#2C2C2C] w-full h-[300px]">
            <img
              src={receipt}
              alt="Uploaded receipt"
              className="mx-auto h-full object-contain"
            />
          </div>
          {/* <img src={receipt} className="w-full h-[400px]"/> */}
          <Button
            size={"xl"}
            variant={"outline"}
            className="mx-auto"
            onClick={() => handleFileDownload(receipt, "reciept")}
            disabled={downloading}
          >
            Download
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="px-4 sm:px-8 py-8">
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
  oneShot,
  studentPaymentId,
  onUploadSuccess,
}: {
  semester?: number;
  installment?: number;
  oneShot: boolean;
  studentPaymentId: any;
  onUploadSuccess: (data: any) => void;
}) {
  const [reciptUrl, setReciptUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleEditImage = () => {
    const fileInput = document.getElementById(
      `input[type="file"]`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDeleteImage = async (fileKey: string, index?: number) => {
    try {
      // if (!fileKey) {
      //   console.error("Invalid file fURL:", fileKey);
      //   return;
      // }
      // Check if fileKey is actually a string before trying to use includes
      // if (typeof fileKey === "string") {
      //   // Proceed with your file deletion logic here
      //   const deleteCommand = new DeleteObjectCommand({
      //     Bucket: "dev-application-portal", // Replace with your bucket name
      //     Key: fileKey, // Key extracted from file URL
      //   });
      //   await s3Client.send(deleteCommand);
      //   console.log("File deleted successfully from S3:", fileKey);
      //   // Remove from UI
      //   setReceiptUrl("");
      // } else {
      //   console.error("The file URL is not valid or does not contain the expected condition:", fileKey);
      // }
      setSelectedImage(null);
      setReciptUrl("");
    } catch (error) {
      console.error("Error deleting file:", error);
      // setUploadError("Failed to delete file. Try again.");
    }
  };

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post(
      `https://dev.apply.litschool.in/student/generate-presigned-url`,
      {
        bucketName: "dev-application-portal",
        key: fileKey,
      }
    );
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

  const uploadMultipart = async (
    file: File,
    fileKey: string,
    chunkSize: number
  ) => {
    const uniqueKey = fileKey;

    const initiateRes = await axios.post(
      `https://dev.apply.litschool.in/student/initiate-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
      }
    );
    const { uploadId } = initiateRes.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partRes = await axios.post(
        `https://dev.apply.litschool.in/student/generate-presigned-url-part`,
        {
          bucketName: "dev-application-portal",
          key: uniqueKey,
          uploadId,
          partNumber: i + 1,
        }
      );
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
    await axios.post(
      `https://dev.apply.litschool.in/student/complete-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        parts,
      }
    );
    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const removeFile = (index: number) => {
    setSelectedImage(null);
    setReceiptFile("");
    setReciptUrl("");
  };

  // Actually send the first file to the server
  const handleSubmit = async () => {
    setLoading(true);
    let payload;

    if (oneShot) {
      payload = {
        receiptUrl: reciptUrl.toString(),
        oneshotPaymentId: studentPaymentId,
      };
    } else if (semester && installment) {
      payload = {
        receiptUrl: reciptUrl.toString(),
        installmentId: studentPaymentId.toString(),
      };
    }

    console.log("payload", payload);

    try {
      const response = await uploadFeeReceipt(payload);
      console.log("Receipt uploaded successfully:", response);
      onUploadSuccess(response.data);

      setReceiptFile("");
      setReciptUrl("");
      setError(null);
    } catch (err: any) {
      console.error("Error uploading receipt:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, "-");
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
              <Button
                size="icon"
                type="button"
                className="bg-[#3698FB] rounded-xl"
              >
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
      {selectedImage ? (
        <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[200px]">
          <img
            src={selectedImage}
            alt="Uploaded receipt"
            className="mx-auto h-full object-contain"
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            {/* <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                      onClick={handleEditImage}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    /> */}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
              onClick={() => handleDeleteImage(reciptUrl)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full h-16 border-2 border-[#64748B] border-dashed rounded-xl p-1.5">
          <label className="w-full pl-3 text-muted-foreground">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <span className="text-xs sm:text-base cursor-pointer">
              Upload Acknowledgement Receipt
            </span>
          </label>
          <Button
            className="flex gap-2 text-white px-6 py-6 rounded-xl"
            onClick={() =>
              document
                .querySelector<HTMLInputElement>(`input[type="file"]`)
                ?.click()
            }
          >
            <UploadIcon className="w-4 h-4" /> Choose
          </Button>
        </div>
      )}

      <Button
        size={"xl"}
        disabled={loading || uploading || !receiptFile}
        className="text-white w-fit"
        onClick={handleSubmit}
      >
        Submit
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
