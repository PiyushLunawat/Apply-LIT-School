import React, { useContext, useEffect, useState } from 'react';
import { getCurrentStudent, submitTokenReceipt } from '~/utils/studentAPI';
import { Pencil, X } from 'lucide-react';
import ProgressBar from '~/components/molecules/ProgressBar/ProgressBar';
import Review from '~/components/organisms/Review/Review';
import InterviewDetails from '../components/InterviewDetails';
import AdmissionFee from '../components/AdmissionFee';

export const ApplicationStatus: React.FC = () => {
  const [isPaymentVerified, setIsPaymentVerified] = useState<string | null>(null);
  const [isInterviewScheduled, setIsInterviewScheduled] = useState<string | null>(null);
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
        setStudentData(res.data)
        setIsPaymentVerified(isVerified);
        setIsInterviewScheduled(res.data?.applicationDetails?.applicationStatus)
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
      { (isPaymentVerified === null || isPaymentVerified === undefined) ?
        (isInterviewScheduled !== 'Interview Scheduled' ? 
        <div className="max-w-[1216px] sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
          <Review setIsPaymentVerified={setIsPaymentVerified}/>
          <div className="space-y-4 sm:space-y-6">
            <ProgressBar currentStage={2} />
            <img
              src="/assets/images/application-process-02.svg"
              alt="Application Process Step 2"
              className="w-screen object-cover h-[188px] sm:h-full sm:rounded-3xl"
            />
          </div>
        </div> : 
        <>
          <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-screen object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
          <div className="mt-10 sm:mt-16 w-full px-4 justify-center items-center">
             <InterviewDetails student={studentData}/>
          </div>
        </>
        ) : (
          <>
            <img src="/assets/images/application-process-02-done.svg" alt="BANNER" className="w-screen object-center object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
            <div className=" w-full px-4 justify-center items-center">
              <AdmissionFee />
            </div>
          </>
      )}
    </>
  );
};

export default ApplicationStatus;

