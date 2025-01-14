import React, { useEffect, useState } from 'react';
import StatusMessage from '~/components/molecules/ApplicationStatus/ApplicationStatus';
import InterviewFeedback from '../InterviewFeedback/InterviewFeedback';
import BookYourSeat from '../../molecules/BookYourSeat/BookYourSeat';
import { getCurrentStudent } from '~/utils/studentAPI';
import Feedback from '~/components/molecules/Feedback/Feedback';
import { log } from 'node:console';

interface ReviewProps {
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
}

const Review: React.FC<ReviewProps> = ({ setIsPaymentVerified }) => {
  const allowedStatuses = [
    "under review",
    "on hold",
    "accepted",
    "rejected",
    "concluded",
    "selected",
    "waitlist",
    "not qualified",
  ] as const;

    const [name, setName] = useState("");
    const [status, setStatus] = useState("");
    const [time, setTime] = useState("");
    const [filledSeats, setFilledSeats] = useState(0);

  
  const [studentData, setStudentData] = useState<any>(null);
  const [appliData, setAppliData] = useState<any>(null);
  const [pass, setPass] = useState(false);

  const strengths = ['Influencer Cost Breakdown', 'Effective Outreach', 'Good Engagement'];
  const weaknesses = ['Limited Target Audience', 'Budget Oversight'];
  const opportunities = ['New Market Segment', 'Potential Partnerships'];
  const threats = ['Competitor Growth'];

  // Initialize from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    fetchCurrentStudentData();
  
    const intervalId = setInterval(fetchCurrentStudentData, 5000);
  
    return () => clearInterval(intervalId);
  }, [studentData?._id]);
  
  async function fetchCurrentStudentData() {
    if (!studentData?._id) return;
    try {
      const res = await getCurrentStudent(studentData._id);
      const fetchedData = res.data;
  
      setAppliData(fetchedData);
      setName(fetchedData?.firstName);
      setStatus(fetchedData?.applicationDetails?.applicationStatus);
      console.log("fwf",fetchedData?.applicationDetails?.applicationStatus);
      
      setTime(fetchedData?.applicationDetails?.updatedAt);
      setFilledSeats(fetchedData?.cohort?.filledSeats?.length || 0);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  }
  
  return (
    <div className='h-fit mb-16 sm:mb-24' >
      <div className={`${status === "on hold" ? 'grayscale h-[400px] sm:h-[500px] ' : status === "accepted" ? 'h-[550px] sm:h-[650px] grayscale-0' : status === "rejected" ? 'h-[350px] sm:h-[450px] grayscale-0' : 'h-[250px] sm:h-[350px] grayscale-0'} absolute top-0 left-0 right-0 mt-[50px] absolute bg-black-to-b from-blue-900 to-transparent mb-24`} style={{
        backgroundImage: `url('/assets/images/application-review-banner.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        }}>
      </div>
            <StatusMessage 
            name={name}
            time={time}
            messageType={status}
            bgClassName=""/> 

            <div className='z-10 relative mx-4'>
              {!(status === 'under review' || status == '') && <Feedback setIsPaymentVerified={setIsPaymentVerified} status={status} feedbackList={appliData} setPass={setPass} booked={filledSeats}/>}
            </div>
           
           
            {/* <>
              <InterviewFeedback
              fileName="Application_0034.pdf"
              strengths={strengths}
              status={`rejected`}
              weaknesses={weaknesses}
              opportunities={opportunities}
              threats={threats}
              date="3 September, 2024"
                  />
            </> */}
      
        
    </div>
  );
};

export default Review;
