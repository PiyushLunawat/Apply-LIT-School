import { CirclePause, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ApplicationReview from '../../organisms/ApplicationReview/ApplicationReview';

interface StatusMessageProps {
  name: string; // e.g., "John"
  messageType: string;
  bgClassName: string;
  timeRemaining?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  name,
  messageType,
  bgClassName,
  timeRemaining,
}) => {
  const [headMessage, setHeadMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  // Update headMessage and subMessage based on messageType
  useEffect(() => {
    switch (messageType) {
      case 'under review':
        setHeadMessage(`Hey ${name}, your application is under review...`);
        setSubMessage(
          'Hold on tight, your application review will be made available to you within 24 hours! You will then proceed to schedule your interview call based on your performance.'
        );
        break;
      case 'on hold':
        setHeadMessage(`Hey ${name}, your application review has been put on hold...`);
        setSubMessage(
          'Looks like you missed out on a few deliverables. Your review process will continue once you review and re-submit your application with the required updates.'
        );
        break;
      case 'accepted':
        setHeadMessage('Congratulations! Your application has been accepted.');
        setSubMessage(
          'We have curated feedback based on your submission. Review your feedback and proceed to book your interview call with our counsellor.'
        );
        break;
      case 'rejected':
        setHeadMessage(`Hey ${name}, we’re very sorry but we cannot move forward with your application.`);
        setSubMessage(
          'We have curated feedback based on your submission. You may choose to apply again for a different cohort and/or program of your choice.'
        );
        break;
      case 'concluded':
        setHeadMessage(`Your Interview has Concluded.`);
        setSubMessage(
          'A decision from your counsellor is pending. Once approved, you can proceed to secure your seat by completing the reservation fee payment.'
        );
        break;
      case 'selected':
          setHeadMessage(`Congratulations on acing your interview!`);
          setSubMessage(
            'Reserve your seat for the Creator Marketer Cohort Scheduled for Oct 22, 2024 by completing the payment of your reservation fee.'
          );
          break;
      case 'waitlist':
        setHeadMessage(`Hey John, you have been put on the waitlist.`);
        setSubMessage(
          'Thank you for taking the counselling interview. You have been waitlisted. You will be updated with regards to your seat approval before 24 October, 2024.'
        );
        break;
      case 'not qualified':
        setHeadMessage(`Hey John, you have not qualified for the upcoming Creator Marketer Cohort.`);
        setSubMessage(
          'Thank you for taking the counselling interview. You may choose to apply again for a different cohort and/or program of your choice.'
        );
        break;  
      default:
        setHeadMessage('');
        setSubMessage('');
    }
  }, [messageType, name]);

  return (
    <>
      <div className='flex relative w-screen h-[250px] sm:h-[350px] px-auto' >
        <div className='w-full md:w-[850px] mx-auto flex flex-col gap-4 sm:gap-8 justify-center items-center'>
          {(messageType === 'on hold' || messageType === 'under review' || messageType === 'concluded') && (
            <div
              className={`flex justify-center items-center gap-2 px-6 py-2 sm:py-4 border ${
                messageType === 'on hold' ? 'border-[#F8E000]' : 'border-[#00A3FF]'
              } bg-[#FFFFFF33] rounded-full text-sm sm:text-2xl`}
            >
              {messageType === 'on hold' ? (
                <CirclePause className='w-4 h-4 sm:w-6 sm:h-6 text-[#F8E000]' />
              ) : (
                <Clock className='w-4 h-4 sm:w-6 sm:h-6 text-[#00A3FF]' />
              )}
              24:00:00
            </div>
          )}
          <div className='mx-8 sm:mx-16 text-2xl sm:text-3xl md:text-5xl font-bold text-center'>
            {headMessage}
          </div>
          <div className='mx-8 sm:mx-16 text-xs sm:text-sm md:text-base text-center'>
            {subMessage}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusMessage;
