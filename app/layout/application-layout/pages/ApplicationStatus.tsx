import React, { useContext, useEffect, useState } from 'react';
import { getCurrentStudent, submitTokenReceipt } from '~/utils/studentAPI';
import { Pencil, X } from 'lucide-react';
import ProgressBar from '~/components/molecules/ProgressBar/ProgressBar';
import Review from '~/components/organisms/Review/Review';
import InterviewDetails from '../components/InterviewDetails';
import AdmissionFee from '../components/AdmissionFee';
import SubHeader from '~/components/organisms/SubHeader/SubHeader';

export const ApplicationStatus: React.FC = () => {
  const [isPaymentVerified, setIsPaymentVerified] = useState<string | null>(null);
  const [isInterviewScheduled, setIsInterviewScheduled] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [submessage, setSubmessage] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const fetchDataOnMount = async () => {
      try {
        setLoading(true);

        // 1) Try reading from local storage
        const storedData = localStorage.getItem('studentData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setStudentData(parsedData);

          // 2) If there's a valid ID, fetch updated info
          if (parsedData?._id) {
            const res = await getCurrentStudent(parsedData._id);
            const latest = res.data;
            
            // Check token fee verification status
            const isVerified =
              latest?.cousrseEnrolled?.[latest.cousrseEnrolled.length - 1]?.tokenFeeDetails?.verificationStatus;
              if(isVerified === 'pending') {
                setSubtitle('Your Payment is being verified');
                setSubmessage(`You may access your dashboard once your payment has been verified.`);
              } else if(isVerified === 'flagged') {
                setSubtitle('Your Payment verification failed');
                setSubmessage(`You may access your dashboard once your payment has been verified.`);
              } else if(isVerified === 'paid') {
                setSubtitle('Your Payment is verified');
                setSubmessage(`You may access your dashboard.`);
              }
            setStudentData(latest);
            setIsPaymentVerified(isVerified);
            setIsInterviewScheduled(latest?.applicationDetails?.applicationStatus);
          }
        }
      } catch (err) {
        setError('Failed to fetch student data. Please try again later.');
      } finally {
        setLoading(false);
        console.log("re rendering")
      }
    };

    fetchDataOnMount();
  }, []);

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
          <SubHeader subtitle='Welcome to LIT' submessage='Your interview call is booked with our counsellors' />
          <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-screen object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
          <div className="mt-10 sm:mt-16 w-full px-4 justify-center items-center">
             <InterviewDetails student={studentData}/>
          </div>
        </>
        ) : (
          <>
            <SubHeader subtitle={subtitle} submessage={submessage} />
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

