import React from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component
import BookYourSeat from '../BookYourSeat/BookYourSeat';

interface FeedbackProps {
  status: string;
  feedbackList: any;
  setPass: React.Dispatch<React.SetStateAction<boolean>>;
  booked: number;
}

const Feedback: React.FC<FeedbackProps> = ({ status, feedbackList, setPass, booked }) => {

  console.log("SGsdfb",feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0]?.overallFeedback[0]?.feedback)
  return (
    <div className={`${status === "on hold" ? 'shadow-[0px_4px_32px_rgba(121,121,121,0.2)]' : status === "accepted" ? 'shadow-[0px_4px_32px_rgba(0,163,122551,0.2)]' : 'shadow-[0px_4px_32px_rgba(255,80,61,0.2)]'} max-w-[1216px] z-10 bg-[#09090B] border border-[#2C2C2C] text-white px-4 sm:px-6 py-6 sm:py-8 mx-auto rounded-2xl justify-between items-start`}>
    <div className="flex justify-between">
      <div className="text-lg sm:text-xl font-semibold mb-4">
        {status === "on hold" ? 'Reason for hold up' : 'Feedback'}
      </div>
      <div className="text-sm sm:text-base">{new Date(feedbackList?.applicationDetails?.updatedAt).toLocaleString()}</div>
    </div>
    {status === "on hold" ? (
      <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
        {feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0]?.overallFeedback[0]?.feedback.map((item: any, index: any) => (
          <li className="text-sm sm:text-base" key={index}>
            {item}
          </li>
        ))}
      </ul>
    ) : (status === "rejected" || status === "accepted") ? (
      <div className="space-y-4">
        {feedbackList?.applicationDetails?.applicationTasks[0]?.applicationTaskDetail?.applicationTasks[0].tasks?.map((task: any, index: any) => (
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
    {!(status === "rejected" || status === "accepted") &&
    <div className="flex justify-center mt-8">
      <Button size="xl" className=" mx-auto px-8"  onClick={() => { if (status === "accepted") {setPass(true);}}}>
        {status === "on hold" ? 'Revise Your Application' : 'Schedule Interview'}
      </Button>
    </div>}

    {status === "accepted" && <BookYourSeat booked={booked}/>}

  </div>
  );
};

export default Feedback;
