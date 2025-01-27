import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component
import BookYourSeat from '../BookYourSeat/BookYourSeat';
import { getCurrentStudent } from '~/utils/studentAPI';
import { UserContext } from '~/context/UserContext';
import { useNavigate } from '@remix-run/react';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { SchedulePresentation } from '~/components/organisms/schedule-presentation-dialog/schedule-presentation';

interface FeedbackProps {
  status: string;
  feedbackList: any;
  setPass: React.Dispatch<React.SetStateAction<boolean>>;
  booked: number;
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
}

const Feedback: React.FC<FeedbackProps> = ({ status, feedbackList, setPass, booked, setIsPaymentVerified }) => {
  const { studentData } = useContext(UserContext);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [student, setStudent] = useState<any>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        setStudent(student.data);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, []);

  const handleReviseApplication = () => {
    navigate('../application/step-1');
  };

  const handleScheduleInterview = async () => {
    const reviewerEmails = student?.cohort?.collaborators
      ?.filter((collaborator: any) => collaborator.role === "interviewer")
      .map((collaborator: any) => collaborator.email);
  
    if (!reviewerEmails || reviewerEmails.length === 0) {
      console.error("No reviewer emails found.");
      return;
    }
  
    const payload = {
      emails: reviewerEmails,
      eventCategory: "Application Test Review", // Change to "Litmus Test Review" if required
    };
  
    // try {
    //   const response = await fetch(
    //     "https://main.d2ogeweki0hgqu.amplifyapp.com/application-portal/get-all-users",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(payload),
    //     }
    //   );
  
    //   if (!response.ok) {
    //     throw new Error(`Failed to schedule interview: ${response.statusText}`);
    //   }
  
    //   const result = await response.json();
    //   console.log("Interview scheduled successfully:", response,result);
  
      // Optionally set dialog open or show success message
    // } 
    // catch (error) {
    //   console.error("Error scheduling interview:", error);
    //   alert("Failed to schedule interview. Please try again later.");
    // }
    setInterviewOpen(true);
  };
  

  return (
    <div className={`${status === "on hold" ? 'shadow-[0px_4px_32px_rgba(121,121,121,0.2)]' : status === "accepted" ? 'shadow-[0px_4px_32px_rgba(0,163,122551,0.2)]' : 'shadow-[0px_4px_32px_rgba(255,80,61,0.2)]'} max-w-[1216px] z-10 bg-[#09090B] border border-[#2C2C2C] text-white px-4 sm:px-6 py-6 sm:py-8 mx-auto rounded-2xl justify-between items-start`}>
    <div className="flex justify-between items-center mb-4">
      <div className="text-lg sm:text-xl font-semibold ">
        {status === "on hold" ? 'Reason for hold up' : 'Feedback'}
      </div>
      <div className="text-xs sm:text-base flex uppercase">{new Date(feedbackList?.applicationDetails?.updatedAt).toLocaleString()}</div>
    </div>
    {status === "on hold" ? (
      <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
        {feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0]?.overallFeedback[feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0]?.overallFeedback.length-1]?.feedback.map((item: any, index: any) => (
          <li className="text-sm sm:text-base" key={index}>
            {item}
          </li>
        ))}
      </ul>
    ) : (status === "rejected" || status === "accepted") ? (
      <div className="space-y-4">
        {feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0].tasks?.map((task: any, index: any) => (
          task?.feedback.length>0 && 
          <div key={task._id}>
              <div className="text-sm sm:text-base font-semibold text-[#00A3FF]">
                Task 0{index+1}
              </div>
                {task?.feedback?.map((item: any, i: any) => (
                  <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
                    <li className="text-sm sm:text-base" key={i}>
                      {item}
                    </li>
                  </ul>
                ))}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-sm sm:text-base">No feedback available.</div>
    )}
    {!(status === "rejected") &&
    <div className="flex justify-center mt-8">
      <Button size="xl" className=" mx-auto px-8"
        onClick={() => {
          if (status === "on hold") {
            handleReviseApplication();
          } else if (status === "accepted") {
            handleScheduleInterview();
          }
        }}>
        {status === "on hold" ? 'Revise Your Application' : 'Schedule Interview'}
      </Button>
    </div>}

    {status === "accepted" && <BookYourSeat booked={booked} setIsPaymentVerified={setIsPaymentVerified}
    />}
  <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
    <DialogContent className="max-w-2xl">
      <SchedulePresentation interviewr={['interviewer']}/>
    </DialogContent>
  </Dialog>
  </div>
  );
};

export default Feedback;
