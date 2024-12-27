import { CirclePause, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface StatusMessageProps {
  name: string; // e.g., "John"
  messageType: string;
  bgClassName: string;
  time?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  name,
  messageType,
  bgClassName,
  time,
}) => {
  const [headMessage, setHeadMessage] = useState<string | JSX.Element>('');
  const [subMessage, setSubMessage] = useState('');
  const [countdown, setCountdown] = useState<string>('');
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null); // Use ReturnType<typeof setInterval>

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
        setHeadMessage(
          <>
            <span className="text-[#00A3FF]">Congratulations!</span> Your application has been accepted.
          </>
        );
        setSubMessage(
          'We have curated feedback based on your submission. Review your feedback and proceed to book your interview call with our counsellor.'
        );
        break;
      case 'rejected':
        setHeadMessage(
          <>
            Hey {name}, we’re very sorry but we <span className="text-[#FF503D]">cannot move forward</span> with your application.
          </>
        );
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
        setHeadMessage(`Congratulations on clearing the interview!`);
        setSubMessage(
          'Reserve your seat for the Creator Marketer Cohort Scheduled for Oct 22, 2024 by completing the payment of your reservation fee.'
        );
        break;
      case 'waitlist':
        setHeadMessage(`Hey ${name}, you have been put on the waitlist.`);
        setSubMessage(
          'Thank you for taking the counselling interview. You have been waitlisted. You will be updated with regards to your seat approval before 24 October, 2024.'
        );
        break;
      case 'not qualified':
        setHeadMessage(`Hey ${name}, you have not qualified for the upcoming Creator Marketer Cohort.`);
        setSubMessage(
          'Thank you for taking the counselling interview. You may choose to apply again for a different cohort and/or program of your choice.'
        );
        break;
      default:
        setHeadMessage('');
        setSubMessage('');
    }
  }, [messageType, name]);

  // Calculate and update the countdown
  useEffect(() => {
    if (time) {
      const targetTime = new Date(time).getTime() + 24 * 60 * 60 * 1000; // Add 24 hours to the provided time
      const updateCountdown = () => {
        const now = Date.now();
        const remainingTime = targetTime - now;

        if (remainingTime <= 0) {
          setCountdown('00:00:00');
          if (intervalId !== null) clearInterval(intervalId); // Safely clear interval
        } else {
          const hours = Math.floor(remainingTime / (1000 * 60 * 60));
          const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

          setCountdown(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        }
      };

      updateCountdown(); // Initial call to set the countdown
      const id = setInterval(updateCountdown, 1000);
      setIntervalId(id); // Set intervalId as a number (or Timeout in Node.js)

      return () => {
        if (id) {
          clearInterval(id); // Cleanup the interval
        }
      };
    }
  }, [time]);

  return (
    <>
      <div className='bg-transparent flex relative h-[250px] sm:h-[350px] px-auto'>
        <div className='w-full md:w-[850px] mx-auto flex flex-col gap-4 sm:gap-8 justify-center items-center'>
          {(messageType === 'under review' || messageType === 'concluded') && (
          <div className='space-y-2'>  
            <div
              className={`mx-auto w-fit flex justify-center items-center gap-2 px-6 py-2 sm:py-4 border ${
                countdown === '00:00:00' ? 'border-[#FF503D]' : 'border-[#00A3FF]'
              } bg-[#FFFFFF33] rounded-full text-sm sm:text-2xl`}
            >
              {countdown === '00:00:00' ? (
                <CirclePause className='w-4 h-4 sm:w-6 sm:h-6 text-[#FF503D]' />
              ) : (
                <Clock className='w-4 h-4 sm:w-6 sm:h-6 text-[#00A3FF]' />
              )}
              {countdown}
            </div>
            {countdown === '00:00:00' && <div className='text-[#FF503D]'>A reminder has been sent to our team, we'll review it shortly</div>}
          </div>
          )}
          <div className='mx-8 sm:mx-16 text-2xl sm:text-3xl md:text-5xl font-bold text-center'>
            {headMessage}
          </div>
          <div className='mx-8 sm:mx-16 text-xs sm:text-sm md:text-base text-center font-normal'>
            {subMessage}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusMessage;
