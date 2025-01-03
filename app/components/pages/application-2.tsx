import React, { useContext, useEffect, useState } from 'react';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import Review from '../organisms/Review/Review';
import { getCurrentStudent, submitTokenReceipt } from '~/utils/studentAPI';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Pencil, X } from 'lucide-react';

export const ApplicationStep2: React.FC = () => {
  const [isPaymentVerified, setIsPaymentVerified] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reciptUrl, setReciptUrl] = useState("");
  const [error, setError] = useState<string | null>(null);const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null); // State for the uploaded file
    const [uploadError, setUploadError] = useState<string | null>(null);
  
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
  

  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const fetchCurrentStudentData = async () => {
      try {
        if (!studentData?._id) throw new Error('Student ID is missing.');
        const res = await getCurrentStudent(studentData._id);
        console.log("fd",res.data?.cousrseEnrolled?.[res.data.cousrseEnrolled.length - 1]?.tokenFeeDetails?.receiptUrl[0]);
        setReciptUrl(res.data?.cousrseEnrolled?.[res.data.cousrseEnrolled.length - 1]?.tokenFeeDetails?.receiptUrl[0])
        const isVerified = res.data?.cousrseEnrolled?.[res.data.cousrseEnrolled.length - 1]?.tokenFeeDetails?.verificationStatus;
        setIsPaymentVerified(isVerified);
      } catch (err) {
        setError('Failed to fetch student data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (studentData) {
      fetchCurrentStudentData();
    }
  }, [studentData]);

  const handleSubmitImage = async () => {
    if (!receiptFile) {
      alert('Please upload a receipt image.');
      return;
    }

    setUploadError(null)

    const formData = new FormData();
    formData.append('paymentType', studentData?.paymentMethod); // Add paymentType to formData
    formData.append('receipt', receiptFile); // Add receipt image file to formData

    try {
      setLoading(true);
      console.log("tis",studentData?.paymentMethod,receiptFile);
    
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
    <>
      {(isPaymentVerified === "" || isPaymentVerified === undefined) ? (
        <div className="w-full">
          <Header subtitle="" />
          <div className="max-w-[1216px] mx-8 sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
            <Review />
            <div className="space-y-4 sm:space-y-6">
              <ProgressBar currentStage={2} />
              <img
                src="/assets/images/application-process-02.svg"
                alt="Application Process Step 2"
                className="w-full rounded-xl sm:rounded-3xl"
              />
            </div>
          </div>
          <Footer />
        </div>
      ) : (
        <div className="w-full">
          {isPaymentVerified === "pending" &&
          <Header
            subtitle="Your Payment is being verified"
            submessage="You may access your dashboard once your payment has been verified"
          />}
          {isPaymentVerified === "paid" &&
          <Header
            subtitle="Your Payment is verified"
            submessage="You may access your dashboard once your payment has been verified"
          />}
          {isPaymentVerified === "flagged" &&
          <Header
            subtitle="Your Payment verification failed"
            submessage="You may access your dashboard once your payment has been verified"
          />}
          <img
            src="/assets/images/application-process-02.svg"
            alt="Payment Verification"
            className="w-screen my-8 sm:my-12"
          />
          <div className="w-full px-6 justify-center items-center">
            <Card className="max-w-4xl mx-auto px-6 py-8">
              <div className="mx-4 space-y-4">
                <div className="flex justify-between items-center">
                  {isPaymentVerified === "pending" && <div className="text-2xl font-normal">Payment Receipt is being verified</div>}
                  {isPaymentVerified === "paid" && <div className="text-2xl font-normal">Payment Receipt is verified</div>}
                  {isPaymentVerified === "flagged" && <div className="text-2xl font-normal">Payment Receipt verification failed</div>}
                  <div className="font-normal">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="font-normal">
                  Paid via {studentData?.paymentMethod || 'Bank Transfer'} to LITschool
                </div>
                {isPaymentVerified !== "flagged" ? 
                <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
                  <img
                    src={reciptUrl || '/assets/images/default-receipt.svg'}
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
                          className="mx-auto h-full  "
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
                    onClick={handleSubmitImage} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
                </div>}
              </div>
            </Card>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ApplicationStep2;
