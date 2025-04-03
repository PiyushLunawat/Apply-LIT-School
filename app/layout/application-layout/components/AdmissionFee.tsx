import React, { useContext, useEffect, useState } from 'react';
import { getCurrentStudent, submitTokenReceipt } from '~/api/studentAPI';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, LoaderCircle, Pencil, X } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import axios from 'axios';
import { Progress } from '~/components/ui/progress';

const s3Client = new S3Client({
  
});

interface AdmissionFeeProps {
  student: any
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
  const [fileName, setFileName] = useState('');

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];

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
      document.getElementById('image-upload')?.click();
    };
 
   const handleSubmitImage = async () => {
     if (!receiptUrl) {
       return;
     }
 
     setUploadError(null)

     const formData = new FormData();
     formData.append('cohortId', tokenFeeDetails?.cohortId); 
     formData.append('paymentType', tokenFeeDetails?.paymentType); 
     formData.append('fileUrl', receiptUrl); 
 
     try {
       setLoading(true);

       const response = await submitTokenReceipt(formData);
       setTokenFeeDetails(response.data)
     } catch (error) {
       setUploadError('Error uploading receipt. Please try again.');
       console.error('Error uploading receipt:', error);
     } finally {
       setLoading(false);
     }
   };
 
   if (error) {
     return (
       <div className="w-full flex items-center justify-center min-h-screen">
         <div>{error}</div>
       </div>
     );
   }

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
    const fileKey = generateUniqueFileName(file.name);
    
    setFileName(fileKey);


    // Example chunk threshold
    const CHUNK_SIZE = 100 * 1024 * 1024;
    e.target.value = '';

    try {
      setUploading(true);
      let fileUrl = '';
      if (file.size <= CHUNK_SIZE) {
        fileUrl = await uploadDirect(file, fileKey);
      } else {
        fileUrl = await uploadMultipart(file, fileKey, CHUNK_SIZE);
      }
      setReceiptUrl(fileUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error uploading file');
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
        console.error("The file URL is not valid or does not contain the expected condition:", fileKey);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setUploadError("Failed to delete file. Try again.");
    }
  };  

  const uploadDirect = async (file: File, fileKey: string) => {
    const { data } = await axios.post('https://dev.apply.litschool.in/student/generate-presigned-url', {
      bucketName: 'dev-application-portal',
      key: fileKey,
    });
    const { url } = data;

    await axios.put(url, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (evt: any) => {
        if (!evt.total) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percentComplete);
      },
    });
    return url.split('?')[0];
  };

  const uploadMultipart = async (file: File, fileKey: string, chunkSize: number) => {
    const uniqueKey = fileKey;

    // Initiate
    const initiateRes = await axios.post('https://dev.apply.litschool.in/student/initiate-multipart-upload', {
      bucketName: 'dev-application-portal',
      key: uniqueKey,
    });
    const { uploadId } = initiateRes.data;

    // Upload chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let totalBytesUploaded = 0;
    const parts: { ETag: string; PartNumber: number }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const partRes = await axios.post('https://dev.apply.litschool.in/student/generate-presigned-url-part', {
        bucketName: 'dev-application-portal',
        key: uniqueKey,
        uploadId,
        partNumber: i + 1,
      });
      const { url } = partRes.data;

      const uploadRes = await axios.put(url, chunk, {
        headers: { 'Content-Type': file.type },
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
    await axios.post('https://dev.apply.litschool.in/student/complete-multipart-upload', {
      bucketName: 'dev-application-portal',
      key: uniqueKey,
      uploadId,
      parts,
    });

    return `https://dev-application-portal.s3.amazonaws.com/${uniqueKey}`;
  };

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/\s+/g, '-');
    return `${timestamp}-${sanitizedName}`;
  };  

  return (
    <div className='space-y-6'>
      <Card className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8">
        <div className="mx-4 space-y-4">
          <div className="grid sm:flex justify-between items-center">
            {tokenFeeDetails?.verificationStatus === "verification pending" && <div className="text-lg sm:text-2xl font-normal">Payment Receipt is being verified</div>}
            {tokenFeeDetails?.verificationStatus === "paid" && <div className="text-lg sm:text-2xl font-normal">Payment Receipt is verified</div>}
            {tokenFeeDetails?.verificationStatus === "flagged" && 
              <div className="text-[#FF503D] flex gap-2 items-center text-lg sm:text-2xl font-normal">
                <AlertCircle className='w-5 h-5'/>Looks like your payment receipt was rejected
              </div>
            }
            <div className="font-normal">{new Date().toLocaleDateString()}</div>
          </div>
          {tokenFeeDetails?.verificationStatus === "flagged" &&
            <div className='p-3 bg-[#1B1B1C] rounded-xl'>
              <h2 className=''>Reason:</h2>
              {tokenFeeDetails?.feedback?.[tokenFeeDetails?.feedback.length - 1]?.text?.map((item: string, index: number) => (
                <div className="" key={index}>{item}</div>
              ))}
            </div>
          }
            <div className='text-sm sm:text-base space-y-1'>
              <div className="flex gap-2 font-normal">
                Paid via {tokenFeeDetails?.paymentType } to 
                <span className='flex gap-2'>
                    {tokenFeeDetails?.paymentType === 'bank transfer' ? 
                      <img src="/assets/images/bank-transfer-type.svg" alt="M" className="w-4"/> :
                      <img src="/assets/images/cash-type.svg" alt="C" className="w-4"/>
                    }
                    LIT School
                </span>
              </div>
              {tokenFeeDetails?.verificationStatus === 'paid' && (
                <div className="text-muted-foreground text-sm -mt-2">Redirecting to Dashboard in {countdown} seconds...</div>
              )}
            </div>
          
          {tokenFeeDetails?.verificationStatus !== "flagged" ? 
          <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
            <img
              src={tokenFeeDetails?.receipts?.[tokenFeeDetails?.receipts.length - 1]?.url}
              alt="Uploaded receipt"
              className="mx-auto h-full object-contain"
              />
          </div> : 
          <div className='flex flex-col justify-center'>
            <div className="flex flex-col items-center">
              {receiptUrl ? (
                <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                  <img src={receiptUrl} alt="Uploaded receipt" className="mx-auto h-full"/>

                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button variant="outline" size="icon"
                      className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                      onClick={handleEditImage}
                      >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon"
                      className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                      onClick={() => handleDeleteImage(fileName)}
                      >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center bg-[#64748B33] p-4 rounded-xl border-[#2C2C2C] w-full h-[220px]"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <img
                      src="/assets/images/receipt-icon.svg"
                      alt="Upload icon"
                      className="w-14 h-14"
                      />
                    {uploading ? 
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
                          {/* <XIcon className="w-5" onClick={() => handleDeleteImage(fileName)}/> */}
                        </div>
                      </div> :
                      <p className="text-sm">Upload your Acknowledgement Receipt</p>
                    }
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    />
                </label>
              )}
            </div>

            <Button size="xl" variant="outline"
              className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" 
              onClick={handleSubmitImage} disabled={!receiptUrl || loading}>{loading ? 'Re-Uploading...' : 'Re-Upload Receipt and Reserve'}</Button>
          </div>}
        </div>
      </Card>
      {tokenFeeDetails?.feedback && tokenFeeDetails?.feedback.slice().reverse().map((feedback: any, index: any) => (
        <Card key={index} className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8">
          <div className="mx-4 space-y-4">
            <div className="grid sm:flex justify-between items-center">
              <div className="text-[#FF503D] flex gap-2 items-center text-lg sm:text-2xl font-normal">
                <AlertCircle className='w-5 h-5'/>Receipt Rejected
              </div>
              <div className="font-normal">{new Date(feedback?.date).toLocaleDateString()}</div>
            </div>
            <div className='p-3 bg-[#1B1B1C] rounded-xl'>
              <h2 className=''>Reason:</h2>
              {feedback?.text?.map((item: string, index: number) => (
                <div className="" key={index}>{item}</div>
              ))}
            </div>
              <div className='text-sm sm:text-base space-y-1'>
                <div className="flex gap-2 font-normal">
                Paid via {tokenFeeDetails?.paymentType} to 
                <span className='flex gap-2'>
                    {tokenFeeDetails?.paymentType === 'bank transfer' ? 
                    <img src="/assets/images/bank-transfer-type.svg" alt="M" className="w-4"/> :
                    <img src="/assets/images/cash-type.svg" alt="C" className="w-4"/>
                  }
                    LIT School
                </span>
              </div>
            </div>
            
            <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
              <img src={tokenFeeDetails?.receipts?.[tokenFeeDetails?.feedback.length - 1 - index]?.url} alt="Uploaded receipt" className="mx-auto h-full object-contain" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
