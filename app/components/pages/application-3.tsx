import React, { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import Header from '../organisms/Header/Header';
import PersonalDetails from '../molecules/PersonalDetailsForm/PersonalDetailsForm';
import PreviousEducation from '../molecules/PreviousEducation/PreviousEducation';
import EmergencyContactDetails from '../molecules/EmergencyContactDetails/EmergencyContactDetails';
import ParentalInformation from '../molecules/ParentalInformation/ParentalInformation';
import Footer from '../organisms/Footer/Footer';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../molecules/PaymentDialog/PaymentDialog';
import CourseDive from '../molecules/CourseDive/CourseDive';
import Task01 from '../molecules/Task01/Task01';
import Task02 from '../molecules/Task02/Task02';
import LITMUSTest from '../organisms/LITMUSTest/LITMUSTest';
import FeeWaiverCard from '../molecules/FeeWaiverCard/FeeWaiverCard';
import FeedbackForm from '../molecules/FeedbackForm/FeedbackForm';
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
      <Header subtitle={true} />
      <img src="/assets/images/application-process-03.svg" alt="BANNER" className="w-screen my-8 sm:my-12" />
      <div className="w-full px-6 justify-center items-center">
        {!isChallengeSkipped ? (
          <div className='max-w-[1152px] mx-auto'>
            <LITMUSTest />
            <div className="flex flex-col items-start mt-8 space-y-4">
              <div className='flex justify-between px-3 w-full'>
                <div className="text-3xl font-semibold text-white">Scholarship Slabs</div>
                <div><Button variant='link' className=''>Learn More</Button></div>
              </div>
              <div className="flex flex-wrap space-x-4">
                <FeeWaiverCard title="Effort Excellence" waiverAmount="5%" clearanceRange="30-50%" color="text-[#FA69E5] border-[#FA69E5]" />
                <FeeWaiverCard title="Strategic Scholar" waiverAmount="8%" clearanceRange="50-60%" color="text-[#FF791F] border-[#FF791F]" />
                <FeeWaiverCard title="Innovative Initiator" waiverAmount="12%" clearanceRange="60-80%" color="text-[#1388FF] border-[#1388FF]" />
                <FeeWaiverCard title="Creative Crusader" waiverAmount="15%" clearanceRange="80-100%" color="text-[#00CC92] border-[#00CC92]" />
              </div>
            </div>
            <div className="flex flex-col mt-8 p-6 bg-[#1B1B1C] border border-[#2C2C2C] rounded-3xl ">
              <p className="text-xl">
                On skipping the LITMUS Challenge you will <span className="text-red-500 font-bold">NOT</span> be eligible for any scholarship waiver on your fee.
              </p>
              <Button variant="outline" size="xl" className="mt-4 w-fit border-white bg-transparent" onClick={handleSkipChallenge}>
                Skip LITMUS Challenge
              </Button>
            </div>
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
