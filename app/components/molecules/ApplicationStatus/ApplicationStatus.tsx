import { CirclePause, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SchedulePresentation } from '~/components/organisms/schedule-presentation-dialog/schedule-presentation';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Skeleton } from '~/components/ui/skeleton';
import { GetInterviewers } from '~/api/studentAPI';

interface StatusMessageProps {
  student: any;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ student }) => {

  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const applicationDetails = latestCohort?.applicationDetails;
  const applicationStatus = latestCohort?.applicationDetails?.applicationStatus;

  const [headMessage, setHeadMessage] = useState<string | JSX.Element>('');
  const [subMessage, setSubMessage] = useState<string | JSX.Element>('');
  const [countdown, setCountdown] = useState<string>('');
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null); // Use ReturnType<typeof setInterval>
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewer, setInterviewer] = useState<any>([]);
  // Update headMessage and subMessage based on messageType
  useEffect(() => {
    switch (applicationStatus) {
      case 'under review':
        setHeadMessage(`Hey ${student?.firstName}, your application is under review...`);
        setSubMessage(
          'Hold on tight, your application review will be made available to you within 24 hours! You will then proceed to schedule your interview call based on your performance.'
        );
        break;
      case 'on hold':
        setHeadMessage(`Hey ${student?.firstName}, your application review has been put on hold...`);
        setSubMessage(
          'Looks like you missed out on a few deliverables. Your review process will continue once you review and re-submit your application with the required updates.'
        );
        break;
      case 'accepted':
      case 'interview cancelled':
        setHeadMessage(
          <>
            <span className="text-[#00A3FF]">Congratulations!</span> Your application has been accepted.
          </>
        );
        setSubMessage(
          'We have curated feedback based on your submission. Review your feedback and proceed to book your interview call with our counsellor.'
        );
        break;
      case 'interview scheduled':
         case 'interview concluded':
        setHeadMessage(
          <>
            Your Interview has Concluded.
          </>
        );
        setSubMessage(
          'A decision from your counsellor is pending. Once approved, you can proceed to secure your seat by completing the reservation fee payment.'
        );
        break;
      case 'rejected':
        setHeadMessage(
          <>
            Hey {student?.firstName}, we’re very sorry but we <span className="text-[#FF503D]">cannot move forward</span> with your application.
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
        setHeadMessage(
          <>
            <span className="text-[#00A3FF]">Congratulations!</span> on clearing the interview!
          </>
        );
        setSubMessage(
          `Reserve your seat for the ${cohortDetails?.programDetail?.name} Cohort Scheduled for ${new Date(cohortDetails?.startDate).toDateString()} by completing the payment of your reservation fee.`
        );
        break;
      case 'waitlist':
        setHeadMessage(`Hey ${student?.firstName}, you have been put on the waitlist.`);
        setSubMessage(
          'Thank you for taking the counselling interview. You have been waitlisted. You will be updated with regards to your seat approval before 24 October, 2024.'
        );
        break;
      case 'not qualified':
        setHeadMessage(
          <>
            Hey {student?.firstName}, you have <span className="text-[#FF503D]">not qualified</span> for the upcoming (cohortDetails?.programDetail?.name) Cohort.
          </>
        );
        setSubMessage(
          'Thank you for taking the counselling interview. You may choose to apply again for a different cohort and/or program of your choice.'
        );
        break;
      default:
        setHeadMessage(
          <div className='space-y-2'>
            <Skeleton className="w-[250px] sm:w-[400px] md:w-[500px] bg-white/10 h-12 " />
            <Skeleton className="w-[250px] sm:w-[400px] md:w-[500px] bg-white/10 h-12 " />
          </div>
          );
        setSubMessage(
          <div className='space-y-2'>
            <Skeleton className="w-[280px] sm:w-[500px] md:w-[600px] lg:w-[900px] bg-white/10 h-4 " />
            <Skeleton className="w-[280px] sm:w-[500px] md:w-[600px] lg:w-[900px] bg-white/10 h-4 " />
          </div>
        );
    }
  }, [student]);

  // Calculate and update the countdown
  useEffect(() => {
    if (applicationDetails?.updatedAt) {
      const targetTime = new Date(applicationDetails?.updatedAt).getTime() + 24 * 60 * 60 * 1000; // Add 24 hours to the provided time
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
  }, [student]);

  const handleScheduleInterview = async () => {
  
      const data = {
        cohortId: latestCohort?.cohortId?._id,
        role: 'application_reviewer',
      };

      console.log("liffffst", data);

      
      const response = await GetInterviewers(data);
      console.log("list", response.data);
    
      const payload = {
        emails: response.data,
        eventCategory: "Application Test Review", 
      };
  
      console.log("pay",payload);
      
      try {
        const response = await fetch(
          "https://dev.cal.litschool.in/api/application-portal/get-all-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        
        setInterviewOpen(true);
        if (!response.ok) {
          throw new Error(`Failed to schedule interview: ${response.statusText}`);
        }
    
        const result = await response.json();
        setInterviewer(result.data)
        console.log("Interview scheduled successfully:", result.data);
    
        // Optionally set dialog open or show success message
      } 
      catch (error) {
        console.error("Error scheduling interview:", error);
        // alert("Failed to schedule interview. Please try again later.");
      }
    };

  return (
    <>
      <div className={`bg-transparent flex relative ${['interview scheduled', 'interview concluded'].includes(applicationStatus) ? 'h-[300px] sm:h-[450px]' : 'h-[250px] sm:h-[350px]'} px-auto`}>
        <div className='w-full md:w-[850px] mx-auto flex flex-col gap-4 sm:gap-8 justify-center items-center'>
          {['under review', 'interview scheduled', 'interview concluded'].includes(applicationStatus) && (
          <div className='space-y-2'>  
            <div
              className={`mx-auto w-fit flex justify-center items-center gap-2 px-6 py-2 sm:py-4 border-2 ${
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
          <div className='mx-4 sm:mx-12 text-2xl sm:text-3xl md:text-5xl font-bold text-center'>
            {headMessage}
          </div>
          <div className='mx-8 sm:mx-16 text-xs sm:text-sm md:text-base text-center font-normal'>
            {subMessage}
          </div>

          {['interview scheduled', 'interview concluded'].includes(applicationStatus) &&
            <div className='mx-8 sm:mt-4 sm:mx-16 text-xs sm:text-sm md:text-base text-center font-normal sm:space-y-3'>
              <div className=''>
                If you were unable to attend this interview you may choose to
              </div>
              <Button className='bg-[#FFFFFF2B] hover:bg-[#FFFFFF]/30 rounded' onClick={() => handleScheduleInterview()}>
                Reschedule Your Interview
              </Button>
            </div>
          }
        </div>
      </div>
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
      <DialogTitle></DialogTitle>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl">
          <SchedulePresentation student={student} interviewer={interviewer} eventCategory='Application Test Review'/>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusMessage;
