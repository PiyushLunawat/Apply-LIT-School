import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'; 
import { Button } from '~/components/ui/button'; 
import { Label } from '~/components/ui/label';
import { ArrowLeft, LoaderCircle, Pencil, X, XIcon } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { submitTokenReceipt } from '~/api/studentAPI';
import axios from 'axios';

import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Progress } from '~/components/ui/progress';

const s3Client = new S3Client({
  
});

interface TokenPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  cohortId: string;
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
}

const TokenPaymentDialog: React.FC<TokenPaymentDialogProps> = ({ open, setOpen, cohortId, setIsPaymentVerified }) => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'bank transfer'>('cash');
  const [secondDialogOpen, setSecondDialogOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const handleNextClick = () => {
    setSecondDialogOpen(true); // Open the second dialog when "Next" is clicked
  };

  const [receiptUrl, setReceiptUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleEditImage = () => {
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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

  const handleSubmitImage = async () => {
    setUploadError(null);

    const feePayload = {
      cohortId: cohortId,
      paymentType: selectedPayment,
      fileUrl: receiptUrl,
     }

    try {
      setLoading(true);    

      const response = await submitTokenReceipt(feePayload);
      console.log('Receipt uploaded successfully:', response);

      setIsPaymentVerified('pending');
    } catch (error) {
      setUploadError('Error uploading receipt. Please try again.');
      console.error('Error uploading receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <>  
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTitle></DialogTitle>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[100vw] sm:max-w-xl mx-auto space-y-6 sm:space-y-9 bg-[#09090b] rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
        <div className='space-y-6'>
          <div className="flex justify-center">
            <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
          </div>
          <div className='space-y-1'>
            <div className="text-base font-medium ">STEP 01</div>
            <div className="text-3xl font-semibold">Select Payment Mode</div>
          </div>
        </div>

        <RadioGroup className="flex flex-col gap-4 sm:gap-6" value={selectedPayment}
          onValueChange={(value) => setSelectedPayment(value as 'cash' | 'bank transfer')}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className='text-2xl cursor-pointer'>Cash</Label>
            </div>
            <div className="text-base text-muted-foreground text-start">
              You may make a cash payment in person, following which you will receive a receipt. On uploading a soft copy of the receipt on the portal you will be able to access your dashboard.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="bank transfer" id="bank transfer" />
              <Label htmlFor="bank transfer" className='text-2xl cursor-pointer'>Bank Transfer</Label>
            </div>
            <div className="text-base text-muted-foreground text-start">
              You will be provided LIT School’s bank account details. You may make a NEFT transaction to the same account. Once you have made a transaction please upload an acknowledgement receipt.
            </div>
          </div>
        </RadioGroup>

        <Button size="xl" variant="outline" className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" 
          onClick={handleNextClick}>
            Next
        </Button>
      </DialogContent>
    </Dialog>

    <Dialog open={secondDialogOpen} onOpenChange={setSecondDialogOpen}>
    <DialogTitle></DialogTitle>
      <DialogContent className=" max-h-[100vh] !h-fit overflow-y-auto max-w-[100vw] sm:max-w-xl mx-auto space-y-6 bg-[#09090b] rounded-lg px-8 py-8 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)] h-[600px] overflow-hidden overflow-y-auto">
        <div>
          <ArrowLeft className='w-6 h-6 cursor-pointer absolute top-10 left-8' onClick={() => setSecondDialogOpen(false)} />
          <div className='space-y-6'>
              <div className="flex justify-center">
                  <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
              </div>
              <div className='space-y-1'>
                  <div className="text-base font-medium ">STEP 02</div>
                  <div className="text-3xl font-semibold">Upload your Payment Receipt</div>
              </div>
          </div>
        </div>

        <div className='space-y-4 sm:space-y-6'>
          <RadioGroup>{selectedPayment === 'cash' ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="cash" id="cash" checked />
                  <Label htmlFor="cash" className='text-2xl cursor-pointer'>Cash</Label>
                </div>
                <div className="text-base text-muted-foreground text-start">
                  Upload a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="bank transfer" id="bank transfer" checked />
                  <Label htmlFor="bank transfer" className='text-2xl cursor-pointer'>Bank Transfer</Label>
                    </div>
                    <div className="text-base text-muted-foreground text-start">
                        Upload a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                    </div>
                    <div className="flex justify-start gap-2 mt-2 p-4 border border-[#2C2C2C] rounded-lg">
                        <div className="flex flex-col text-left">
                          <p className='flex gap-2 items-center text-base font-medium'>
                            <img src='/assets/images/institute-icon.svg' className='w-4 h-3'/>
                            Disruptive Edu Private Limited
                          </p>
                          <p className='text-sm'>Account No.: 50200082405270</p>
                          <p className='text-sm'>IFSC Code: HDFC0001079</p>
                          <p className='text-sm'>Branch: Sadashivnagar</p>
                        </div>
                      </div>
                  </div>
                </>
              )}
              </RadioGroup>
            <div className="flex flex-col items-center">
              {receiptUrl ? (
                <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                  <img
                    src={receiptUrl}
                    alt="Uploaded receipt"
                    className="mx-auto h-full"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button variant="outline" size="icon"
                      className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                      onClick={() => handleEditImage()}
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
        </div>

        <Button size="xl" variant="outline"
          className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" 
          onClick={handleSubmitImage} disabled={loading || !receiptUrl}>
            {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogContent>
    </Dialog>
  </>

  );
};

export default TokenPaymentDialog;
