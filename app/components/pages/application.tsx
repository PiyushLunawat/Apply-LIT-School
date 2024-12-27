import React, { useEffect, useState } from 'react';
import Header from '../organisms/Header/Header';
import Footer from '../organisms/Footer/Footer';
import ProgressBar from '../molecules/ProgressBar/ProgressBar';
import Review from '../organisms/Review/Review';


export const ApplicationH: React.FC = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [part2, setPart2] = useState(false);

  const handlePayment = () => {
    setPart2(true);
    // Simulate payment logic
    const paymentSuccess = true; // Simulate a payment success or failure
    if (paymentSuccess) {
      setSuccessDialogOpen(true);
    } else {
      setFailedDialogOpen(true);
    }
  };

  return (
    <div className="w-full">
      <Header subtitle="" />
      <Review />
      <div className="max-w-[1216px] mx-8 sm:mx-16 xl:mx-auto justify-center items-center space-y-20">
      
        
        <div className='space-y-4 sm:space-y-6'>
          <ProgressBar currentStage={1} />
          <img src="/assets/images/application-process-02.svg" alt="BANNER" className="w-full rounded-xl sm:rounded-3xl" /> 
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationH;
