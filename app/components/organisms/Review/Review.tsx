import React, { useEffect, useState } from 'react';
import StatusMessage from '~/components/molecules/ApplicationStatus/ApplicationStatus';
import InterviewFeedback from '../InterviewFeedback/InterviewFeedback';
import BookYourSeat from '../../molecules/BookYourSeat/BookYourSeat';
import { getCurrentStudent } from '~/api/studentAPI';
import Feedback from '~/components/molecules/Feedback/Feedback';
import { log } from 'node:console';
import TaskSubmission from '~/components/molecules/TaskSubmission/TaskSubmission';

interface ReviewProps {
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
  application: any;
}

const Review: React.FC<ReviewProps> = ({ setIsPaymentVerified, application }) => {
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

  const latestCohort = application?.appliedCohorts?.[application?.appliedCohorts.length - 1];
  const applicationStatus = latestCohort?.applicationDetails?.applicationStatus;

  const mediaItems = [
    { type: "image", url: "/assets/files/Application_0034.pdf", name: "Application_0034.pdf" },
    { type: "video", url: "/assets/videos/Application_0034.mov", name: "Application_0034.mov" },
    { type: "link", url: "https://www.youtube.com/watch?v=xyz123" },
  ];
  
  return (
    <div className='h-fit mb-16 sm:mb-24' >
        <div className={`${['on hold', 'waitlist'].includes(applicationStatus) ? 'grayscale h-[400px] sm:h-[500px] ' : ['accepted', 'interview cancelled', 'selected'].includes(applicationStatus) ? 'h-[400px] sm:h-[500px] grayscale-0' : ['rejected', 'not qualified'].includes(applicationStatus) ? 'h-[400px] sm:h-[500px] grayscale-0' : ['interview scheduled'].includes(applicationStatus) ? 'h-[300px] sm:h-[450px] grayscale-0' : 'h-[250px] sm:h-[350px] grayscale-0'} absolute top-0 left-0 right-0 mt-[50px] absolute bg-black-to-b from-blue-900 to-transparent mb-24`} style={{
          backgroundImage: `url('/assets/images/application-review-banner.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          }}>
        </div>

        <StatusMessage student={application}/> 

        <div className='z-10 relative mx-4 space-y-12'>
            {['on hold', 'accepted', 'rejected', 'waitlist', 'selected', 'not qualified'].includes(applicationStatus) && 
              <Feedback setIsPaymentVerified={setIsPaymentVerified} student={application}/>
            }
        </div>
    </div>
  );
};

export default Review;
