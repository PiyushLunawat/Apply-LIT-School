import React, { useContext, useEffect, useState } from 'react';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import Review from '../organisms/Review/Review';
import { getCurrentStudent, submitTokenReceipt } from '~/utils/studentAPI';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Pencil, X } from 'lucide-react';
import TokenVerification from '../organisms/TokenVerification/TokenVerification';

export const ApplicationStep2: React.FC = () => {
  const [isPaymentVerified, setIsPaymentVerified] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      {(isPaymentVerified === null || isPaymentVerified === undefined) ? (
        <div className="w-full">
          <Header subtitle="" />
          <div className="max-w-[1216px] mx-8 sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
            <Review setIsPaymentVerified={setIsPaymentVerified}/>
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
        <TokenVerification />
      )}
    </>
  );
};

export default ApplicationStep2;
