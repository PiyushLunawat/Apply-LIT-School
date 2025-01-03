import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component
import BookYourSeat from '../BookYourSeat/BookYourSeat';
import { getCurrentStudent } from '~/utils/studentAPI';
import { UserContext } from '~/context/UserContext';
import { useNavigate } from '@remix-run/react';

interface FeedbackProps {
  status: string;
  feedbackList: any;
  setPass: React.Dispatch<React.SetStateAction<boolean>>;
  booked: number;
}

const Feedback: React.FC<FeedbackProps> = ({ status, feedbackList, setPass, booked }) => {
  const [student, setStudent] = useState<any>([]);
  const navigate = useNavigate();
  const { studentData } = useContext(UserContext);
  
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
    navigate('../dashboard/application-step-1');
  };

  const handleScheduleInterview = () => {
    const reviewerEmails = student?.cohort?.collaborators
      ?.filter((collaborator: any) => collaborator.role === "interviewer")
      .map((collaborator: any) => collaborator.email);
    console.log("Reviewer Emails:", reviewerEmails);
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

    {status === "accepted" && <BookYourSeat booked={booked}/>}

  </div>
  );
};

export default Feedback;
