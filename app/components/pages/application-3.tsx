import React, { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import LITMUSTest from '../organisms/LITMUSTest/LITMUSTest';
import FeeWaiverCard from '../molecules/scholarshipSlabCard/scholarshipSlabCard';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import LITMUSTestReview from '../organisms/LITMUSTestReview/LITMUSTestReview';

export const ApplicationStep3: React.FC = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [part2, setPart2] = useState(false);
  const [isChallengeSkipped, setIsChallengeSkipped] = useState(false); // State to track if the challenge is skipped

  const handlePayment = () => {
    setPart2(true);
    const paymentSuccess = true;
    if (paymentSuccess) {
      setSuccessDialogOpen(true);
    } else {
      setFailedDialogOpen(true);
    }
  };

  const handleSkipChallenge = () => {
    setIsChallengeSkipped(true); // Update state to show the feedback form and progress bar
  };

  return (
    <div className="w-full">
      <Header subtitle="Welcome to LIT" submessage='Get started with your application process' />
      <img src="/assets/images/application-process-03.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6 justify-center items-center">
        {!isChallengeSkipped ? (
          <div className='max-w-[1152px] mx-auto'>
            <LITMUSTest />
          </div>
        ) : (
          <div className='max-w-[1000px] mx-auto'>
            <LITMUSTestReview />
            <div className='space-y-4 sm:space-y-6 mt-16'>
              <ProgressBar currentStage={3} />
              <img src="/assets/images/application-process-03.svg" alt="BANNER" className="w-full rounded-xl sm:rounded-3xl" /> 
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationStep3;
