import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { AlertCircle, CirclePause, Clock, Pencil, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { submitTokenReceipt } from "~/api/studentAPI";
import { getEnvValue } from "~/atoms/envAtoms";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

const s3Client = new S3Client({});

const awsUrl = getEnvValue("REMIX_AWS_BASE_URL");

interface AdmissionFeeProps {
  student: any;
}

export default function AdmissionFee({ student }: AdmissionFeeProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tokenFeeDetails, setTokenFeeDetails] = useState<any>();
  const [receiptUrl, setReceiptUrl] = useState(""); // State for the uploaded file
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];

  useEffect(() => {
    setTokenFeeDetails(latestCohort?.tokenFeeDetails);
  }, [student]);

  useEffect(() => {
    if (tokenFeeDetails?.verificationStatus === "paid") {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate("../../dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [tokenFeeDetails?.verificationStatus, navigate]);

  const handleEditImage = () => {
    document.getElementById("image-upload")?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (receiptUrl) {
      try {
        await handleDeleteImage(fileName); // Delete the old file
      } catch (error) {
        console.error("Error deleting old image:", error);
        setUploadError("Failed to delete previous image.");
        return;
      }
    }
    setUploadError(null);
    setUploadProgress(0);
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const fileKey = generateUniqueFileName(file.name, "admission_fee_receipt");

    setFileName(fileKey);

    // Example chunk threshold
    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = "";

    try {
      setUploading(true);
      let fileUrl = "";
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE);
      }
      setReceiptUrl(fileUrl);

      setUploadError(null);

      const feePayload = {
        cohortId: tokenFeeDetails?.cohortId,
        paymentType: tokenFeeDetails?.paymentType,
        fileUrl: fileUrl,
      };
      const response = await submitTokenReceipt(feePayload);
      setTokenFeeDetails(response.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (fileKey: string, index?: number) => {
    try {
      if (!fileKey) {
        console.error("Invalid file fURL:", fileKey);
        return;
      }
      // Check if fileKey is actually a string before trying to use includes
      if (typeof fileKey === "string") {
        // Proceed with your file deletion logic here
        const deleteCommand = new DeleteObjectCommand({
          Bucket: "dev-application-portal", // Replace with your bucket name
          Key: fileKey, // Key extracted from file URL
        });
        await s3Client.send(deleteCommand);
        console.log("File deleted successfully from S3:", fileKey);
        // Remove from UI
        setReceiptUrl("");
      } else {
        console.error(
          "The file URL is not valid or does not contain the expected condition:",
          fileKey
        );
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setUploadError("Failed to delete file. Try again.");
    }
  };

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post(
      `${getEnvValue(
        "REMIX_PUBLIC_API_BASE_URL"
      )}/student/generate-presigned-url`,
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
    return fileKey;
  };

  const uploadMultipart = async (
    file: File,
    fileKey: string,
    chunkSize: number
  ) => {
    const uniqueKey = fileKey;

    // Initiate
    const initiateRes = await axios.post(
      `${getEnvValue(
        "REMIX_PUBLIC_API_BASE_URL"
      )}/student/initiate-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
      }
    );
    const { uploadId } = initiateRes.data;

    // Upload chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const partRes = await axios.post(
        `${getEnvValue(
          "REMIX_PUBLIC_API_BASE_URL"
        )}/student/generate-presigned-url-part`,
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

    // Complete
    await axios.post(
      `${getEnvValue(
        "REMIX_PUBLIC_API_BASE_URL"
      )}/student/complete-multipart-upload`,
      {
        bucketName: "dev-application-portal",
        key: uniqueKey,
        uploadId,
        parts,
      }
    );

    return uniqueKey;
  };

  const generateUniqueFileName = (originalName: string, folder?: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, "-");
    return `${folder}/${timestamp}-${sanitizedName}`;
  };

  const formatAmount = (value: number | undefined) =>
    value !== undefined
      ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
          Math.round(value)
        )
      : "--";

  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const days =
      latestCohort?.cohortId?.litmusTestDetail[0]?.litmusTestDuration ?? 0;
    const now = new Date();
    const targetDate = new Date(latestCohort?.applicationDetails?.updatedAt);
    const diffInSeconds = Math.floor(
      (targetDate.getTime() - now.getTime()) / 1000
    );
    setRemainingTime(Math.floor(days * 24 * 60 * 60 + diffInSeconds));
  }, [student]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval); // clean up on unmount
  }, []);

  const formatHHMMSS = (totalSeconds: number): string => {
    const totalHours = Math.floor(totalSeconds / 3600);

    if (totalHours <= 72) {
      const hrs = totalHours;
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${String(hrs).padStart(2, "0")}H:${String(mins).padStart(
        2,
        "0"
      )}M:${String(secs).padStart(2, "0")}S`;
    } else {
      const days = Math.floor(totalSeconds / (24 * 3600));
      const remainingSeconds = totalSeconds % (24 * 3600);
      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      return `${days}D:${hrs}H:${mins}M`;
    }
  };

  return (
    <div className="space-y-6">
      {tokenFeeDetails?.verificationStatus === "flagged" ? (
        <Card className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row gap-2 justify:start sm:justify-between items-center">
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`file-input`}
                onChange={(e) => handleImageChange(e)}
              />
              <Button
                size="xl"
                className="w-fit bg-[#00AB7B] hover:bg-[#00AB7B]/90 mx-auto"
                onClick={() => document.getElementById(`file-input`)?.click()}
                disabled={uploading || loading}
              >
                Pay INR ₹
                {formatAmount(
                  latestCohort?.cohortId?.cohortFeesDetail?.tokenFee
                )}
                .00 and Reserve
              </Button>
            </div>
            <div
              className={`w-fit flex justify-center items-center gap-2 px-4 py-2.5 border ${
                remainingTime === 0 ? "border-[#FF503D]" : "border-[#00A3FF]"
              } bg-[#00A3FF33] rounded-full text-sm sm:text-xl font-medium`}
            >
              {remainingTime === 0 ? (
                <CirclePause className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF503D]" />
              ) : (
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-[#00A3FF]" />
              )}
              {formatHHMMSS(remainingTime)}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8">
          <div className="mx-4 space-y-4">
            <div className="grid sm:flex justify-between items-center">
              {tokenFeeDetails?.verificationStatus ===
                "verification pending" && (
                <div className="text-lg sm:text-2xl font-normal">
                  Payment Receipt is being verified
                </div>
              )}
              {tokenFeeDetails?.verificationStatus === "paid" && (
                <div className="text-lg sm:text-2xl font-normal">
                  Payment Receipt is verified
                </div>
              )}
              <div className="font-normal">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="text-sm sm:text-base space-y-1">
              <div className="flex gap-2 font-normal">
                Paid via {tokenFeeDetails?.paymentType} to
                <span className="flex gap-2">
                  {tokenFeeDetails?.paymentType === "bank transfer" ? (
                    <img
                      src="/assets/images/bank-transfer-type.svg"
                      alt="M"
                      className="w-4"
                    />
                  ) : (
                    <img
                      src="/assets/images/cash-type.svg"
                      alt="C"
                      className="w-4"
                    />
                  )}
                  LIT School
                </span>
              </div>
              {tokenFeeDetails?.verificationStatus === "paid" && (
                <div className="text-muted-foreground text-sm -mt-2">
                  Redirecting to Dashboard in {countdown} seconds...
                </div>
              )}
            </div>

            {tokenFeeDetails?.verificationStatus !== "flagged" ? (
              <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                <img
                  src={`${awsUrl}/${
                    tokenFeeDetails?.receipts?.[
                      tokenFeeDetails?.receipts.length - 1
                    ]?.url
                  }`}
                  alt="Uploaded receipt"
                  className="mx-auto h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <div className="flex flex-col items-center">
                  {receiptUrl && (
                    <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                      <img
                        src={`${awsUrl}/${receiptUrl}`}
                        alt="Uploaded receipt"
                        className="mx-auto h-full"
                      />

                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                          onClick={handleEditImage}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                          onClick={() => handleDeleteImage(fileName)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      {tokenFeeDetails?.feedback &&
        tokenFeeDetails?.feedback
          .slice()
          .reverse()
          .map((feedback: any, index: any) => (
            <Card
              key={index}
              className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8"
            >
              <div className="mx-4 space-y-4">
                <div className="grid sm:flex justify-between items-center">
                  <div className="text-[#FF503D] flex gap-2 items-center text-lg sm:text-2xl font-normal">
                    <AlertCircle className="w-5 h-5" />
                    Receipt Rejected
                  </div>
                  <div className="font-normal">
                    {new Date(feedback?.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-[#1B1B1C] rounded-xl">
                  <h2 className="">Reason:</h2>
                  {feedback?.text?.map((item: string, index: number) => (
                    <div className="" key={index}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-sm sm:text-base space-y-1">
                  <div className="flex gap-2 font-normal">
                    Paid via {tokenFeeDetails?.paymentType} to
                    <span className="flex gap-2">
                      {tokenFeeDetails?.paymentType === "bank transfer" ? (
                        <img
                          src="/assets/images/bank-transfer-type.svg"
                          alt="M"
                          className="w-4"
                        />
                      ) : (
                        <img
                          src="/assets/images/cash-type.svg"
                          alt="C"
                          className="w-4"
                        />
                      )}
                      LIT School
                    </span>
                  </div>
                </div>

                <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                  <img
                    src={`${awsUrl}/${
                      tokenFeeDetails?.receipts?.[
                        tokenFeeDetails?.feedback.length - 1 - index
                      ]?.url
                    }`}
                    alt="Uploaded receipt"
                    className="mx-auto h-full object-contain"
                  />
                </div>
              </div>
            </Card>
          ))}
    </div>
  );
}
