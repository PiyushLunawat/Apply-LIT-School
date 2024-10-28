import React, { useEffect, useState } from 'react';
import StatusMessage from '~/components/molecules/ApplicationStatus/ApplicationStatus';
import ApplicationReview from '../ApplicationReview/ApplicationReview';
import BookYourSeat from '../../molecules/BookYourSeat/BookYourSeat';

interface ReviewProps {
  name: string; 
}

const Review: React.FC<ReviewProps> = ({ name, }) => {
  
    const strengths = ['Influencer Cost Breakdown', 'Effective Outreach', 'Good Engagement'];
    const weaknesses = ['Limited Target Audience', 'Budget Oversight'];
    const opportunities = ['New Market Segment', 'Potential Partnerships'];
    const threats = ['Competitor Growth'];

  return (
    <>
      <div className='w-screen px-6' style={{
          backgroundImage: `url('/assets/images/application-review-banner.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <StatusMessage 
            name="John"
            messageType="accepted"
            bgClassName="bg-gradient-to-r from-blue-900 to-black"/> 

        {/* <ApplicationReview
        fileName="Application_0034.pdf"
        strengths={strengths}
        status={`rejected`}
        weaknesses={weaknesses}
        opportunities={opportunities}
        threats={threats}
        date="3 September, 2024"
      /> */}
        
        <BookYourSeat/>
      </div>
    </>
  );
};

export default Review;
