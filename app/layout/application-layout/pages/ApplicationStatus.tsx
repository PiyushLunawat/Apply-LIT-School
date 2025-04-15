import React, { useContext, useEffect, useState } from 'react';
import { getCurrentStudent } from '~/api/studentAPI';
import { Pencil, X } from 'lucide-react';
import ProgressBar from '~/components/molecules/ProgressBar/ProgressBar';
import Review from '~/components/organisms/Review/Review';
import InterviewDetails from '../components/InterviewDetails';
import AdmissionFee from '../components/AdmissionFee';
import SubHeader from '~/components/organisms/SubHeader/SubHeader';
import { UserContext } from '~/context/UserContext';

export const ApplicationStatus: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<any>("");
  const [isInterviewScheduled, setIsInterviewScheduled] = useState<string | null>(null);
  const [latestCohort, setLatestCohort] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [submessage, setSubmessage] = useState("");

  const [showReviewBlock, setShowReviewBlock] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("studentData");
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const fetchDataOnMount = async () => {
      try {
        // setLoading(true);
          // 2) If there's a valid ID, fetch updated info
          if (studentData?._id) {
            const res = await getCurrentStudent(studentData._id);
            console.log("res",res);
            
            setStudent(res);
            const latest = res?.appliedCohorts[res.appliedCohorts.length - 1];
            setLatestCohort(latest);

            const isVerified =
              latest?.tokenFeeDetails?.verificationStatus;
              if(isVerified === 'pending') {
                setSubtitle('Your Payment is being verified');
                setSubmessage(`You may access your dashboard once your payment has been verified.`);
              } else if(isVerified === 'verification pending') {
                  setSubtitle('Your Payment verification failed');
                  setSubmessage(`You may access your dashboard once your payment has been verified.`);
              } else if(isVerified === 'flagged') {
                setSubtitle('Your Payment verification failed');
                setSubmessage(`You may access your dashboard once your payment has been verified.`);
              } else if(isVerified === 'paid') {
                setSubtitle('Your Payment is verified');
                setSubmessage(`You may access your dashboard.`);
              }
            setIsPaymentVerified(isVerified);
          }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataOnMount();
  }, [studentData, refreshKey]);

  useEffect(() => {
    // Only run the interval if 'latest' is defined
    if (!student) return;
  
    const interval = setInterval(() => {
      let meetingEnd: Date | null = null;
      const latest = student?.appliedCohorts[student.appliedCohorts.length - 1];
      const lastInterview =
        latest?.applicationDetails?.applicationTestInterviews?.[
          latest?.applicationDetails?.applicationTestInterviews.length - 1
        ];
      if (lastInterview?.meetingDate && lastInterview?.endTime) {
        // Construct meetingEnd using the meetingDate's string and the endTime.
        meetingEnd = new Date(
          new Date(lastInterview.meetingDate).toDateString() + ' ' + lastInterview.endTime
        );
        // console.log("meetingEnd", new Date() > meetingEnd);
        if (new Date() > meetingEnd) {
          setShowReviewBlock(true);
        }
      }
      setIsInterviewScheduled(latest?.applicationDetails?.applicationStatus);
    }, 100); 
  
    return () => clearInterval(interval);
  }, [student]);
  

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
        <div>{String(error)}</div>
      </div>
    );
  }

  return (
    <>
      {(latestCohort?.tokenFeeDetails === undefined) ?
        (((isInterviewScheduled !== 'interview scheduled' || showReviewBlock) && isInterviewScheduled !== 'interview cancelled')  ? 
          <div className="max-w-[1216px] sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
            <Review setIsPaymentVerified={setRefreshKey} application={student}/>
            <div className="space-y-4 sm:space-y-6">
              <ProgressBar currentStage={2} />
              <img src="/assets/images/application-process-02.svg" alt="Application Process Step 2" className="w-screen object-cover h-[188px] sm:h-full sm:rounded-3xl"/>
            </div>
          </div> : 
          <>
            <SubHeader subtitle='Welcome to LIT' submessage='Your interview call is booked with our counsellors' />
            <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-screen object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
            <div className="mt-10 sm:mt-16 w-full px-4 justify-center items-center">
              <InterviewDetails student={student}/>
            </div>
          </>
        ) : (
          <>
            <SubHeader subtitle={subtitle} submessage={submessage} />
            <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-screen object-center object-cover overflow-x-auto h-[188px] sm:h-full my-6 sm:my-12" />
            <div className=" w-full px-4 justify-center items-center">
              <AdmissionFee student={student}/>
            </div>
          </>
      )}
    </>
  );
};

export default ApplicationStatus;

