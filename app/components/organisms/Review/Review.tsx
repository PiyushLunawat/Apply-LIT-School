import React, { useEffect, useState } from 'react';
import StatusMessage from '~/components/molecules/ApplicationStatus/ApplicationStatus';
import InterviewFeedback from '../InterviewFeedback/InterviewFeedback';
import BookYourSeat from '../../molecules/BookYourSeat/BookYourSeat';
import { getCurrentStudent } from '~/utils/studentAPI';
import Feedback from '~/components/molecules/Feedback/Feedback';

interface ReviewProps {
}

const Review: React.FC<ReviewProps> = ({  }) => {
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
    async function fetchCurrentStudentData() {
      try {
        console.log(' student data:', studentData?._id);

          const res = await getCurrentStudent(studentData?._id);
          console.log(' this is the data:', res.data);
          setAppliData(res.data);
          console.log(' student data:', res.data?.applicationDetails?.updatedAt);
          setName(res.data?.firstName);
          setStatus(res.data?.applicationDetails?.applicationStatus)
          setTime(res.data?.applicationDetails?.updatedAt)
          setFilledSeats(res.data?.cohort?.filledSeats.length)
          console.log("fvv",status, time);
          
         
      } catch (error) {
        console.log('Error fetching student data:', error);
      }
    }

    fetchCurrentStudentData();
  }, [studentData]);

  return (
    <div className='min-h-screen relative' >
      <div className={`${status === "on hold" ? 'grayscale' : 'grayscale-0'}absolute top-0 left-0 right-0 h-[60%] bg-black-to-b from-blue-900 to-transparent mb-24`} style={{
          backgroundImage: `url('/assets/images/application-review-banner.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
            <StatusMessage 
            name={name}
            time={time}
            messageType={status}
            bgClassName="bg-gradient-to-r from-blue-900 to-black"/> 

            <div className=''>
              {!(status === 'under review' || status == '') && <Feedback status={status} feedbackList={appliData} setPass={setPass} booked={filledSeats}/>}
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
    </div>
  );
};

export default Review;
