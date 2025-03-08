import React, { useContext, useEffect, useState } from 'react';
import { getCurrentStudent, submitTokenReceipt } from '~/utils/studentAPI';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AlertCircle, Pencil, X } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import { UserContext } from '~/context/UserContext';

interface AdmissionFeeProps {
  student: any
}

export default function AdmissionFee({ student }: AdmissionFeeProps) {
  const navigate = useNavigate();
    
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<any>(null); 
  const [isPaymentVerified, setIsPaymentVerified] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reciptUrl, setReciptUrl] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null); // State for the uploaded file
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const tokenFeeDetails = latestCohort?.tokenFeeDetails;

  useEffect(() => {
    if (tokenFeeDetails?.receiptUrl) {
      setReciptUrl(tokenFeeDetails.receiptUrl[0]);
    }
    setIsPaymentVerified(tokenFeeDetails?.verificationStatus);
  }, [tokenFeeDetails]);


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

  
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();

        // Preview image
        reader.onload = (e) => {
          if (e.target?.result) {
            setSelectedImage(e.target.result as string);
          }
        };

        reader.readAsDataURL(file);
        setReceiptFile(file); // Store the selected file for upload
      }
    };
   
    const handleDeleteImage = () => {
      setSelectedImage(null); // Remove the image preview
      setReceiptFile(null); // Remove the file from state
    };
  
    const handleEditImage = () => {
      document.getElementById('image-upload')?.click();
    };
     
    async function fetchCurrentStudentData() {
      if (!studentData?._id) return;
      try {
        const res = await getCurrentStudent(studentData._id);
        setStudentData(res)

      } catch (err) {
        setError('Failed to fetch student data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
 
   const handleSubmitImage = async () => {
     if (!receiptFile) {
       alert('Please upload a receipt image.');
       return;
     }
 
     setUploadError(null)
 
     const formData = new FormData();
     formData.append('cohortId', tokenFeeDetails?.cohortId); // Add paymentType to formData
     formData.append('paymentType', tokenFeeDetails?.paymentType); // Add paymentType to formData
     formData.append('receipt', receiptFile); // Add receipt image file to formData
 
     try {
       setLoading(true);
            
       const response = await submitTokenReceipt(formData);
 
       console.log('Receipt uploaded successfully:', response);
     } catch (error) {
       setUploadError('Error uploading receipt. Please try again.');
       console.error('Error uploading receipt:', error);
     } finally {
       setLoading(false);
     }
   };
 
   if (loading) {
     return (
       <div className="w-full flex items-center justify-center min-h-screen">
         <div>Loading...</div>
       </div>
     );
   }
 
   if (error) {
     return (
       <div className="w-full flex items-center justify-center min-h-screen">
         <div>{error}</div>
       </div>
     );
   }

  return (
            <Card className="max-w-4xl mx-auto px-1 sm:px-6 py-6 sm:py-8">
              <div className="mx-4 space-y-4">
                <div className="grid sm:flex justify-between items-center">
                  {isPaymentVerified === "pending" && <div className="text-lg sm:text-2xl font-normal">Payment Receipt is being verified</div>}
                  {isPaymentVerified === "paid" && <div className="text-lg sm:text-2xl font-normal">Payment Receipt is verified</div>}
                  {isPaymentVerified === "flagged" && 
                    <div className="text-[#FF503D] flex gap-2 items-center text-lg sm:text-2xl font-normal">
                      <AlertCircle className='w-5 h-5'/>Looks like your payment receipt was rejected
                    </div>
                  }
                  <div className="font-normal">{new Date().toLocaleDateString()}</div>
                </div>
                {isPaymentVerified === "flagged" &&
                  <div className='p-3 bg-[#1B1B1C] rounded-md'>
                    {tokenFeeDetails?.comment?.[tokenFeeDetails?.comment.length - 1]?.text}
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
                        LITschool
                    </span>
                  </div>
                  {isPaymentVerified === 'paid' && (
                    <div className="text-muted-foreground text-sm -mt-2">Redirecting to Dashboard in {countdown} seconds...</div>
                  )}
                </div>
                
                {isPaymentVerified !== "flagged" ? 
                <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                  <img
                    src={reciptUrl}
                    alt="Uploaded receipt"
                    className="mx-auto h-full object-contain"
                  />
                </div> : 
                <div className='flex flex-col justify-center'>
                  <div className="flex flex-col items-center">
                    {selectedImage ? (
                      <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                        <img
                          src={selectedImage}
                          alt="Uploaded receipt"
                          className="mx-auto h-full"
                        />

                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button variant="outline" size="icon"
                            className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                            onClick={handleEditImage}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon"
                            className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
                            onClick={handleDeleteImage}
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
                          <p className="text-sm">Upload your Acknowledgement Receipt</p>
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
                    onClick={handleSubmitImage} disabled={loading}>{loading ? 'Re-Uploading...' : 'Re-Upload Receipt and Reserve'}</Button>
                </div>}
              </div>
            </Card>
  );
};
