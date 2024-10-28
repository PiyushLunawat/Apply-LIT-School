import React from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component

interface FeedbackProps {
  feedbackList: string[]; // Array of feedback strings
  date: string; // Date string
}

const Feedback: React.FC<FeedbackProps> = ({ feedbackList, date }) => {
  return (
    <div className="border border-[#2C2C2C] text-white px-4 sm:px-6 py-6 sm:py-8 rounded-2xl shadow-[0px_4px_32px_rgba(121,121,121,0.2)] justify-between items-start">
      <div className='flex justify-between'>
        <div className="text-lg sm:text-xl font-semibold mb-4">Feedback</div>
        <div className="text-sm sm:text-base"> {date} </div>
      </div>
        <ul className="ml-4 sm:ml-6 space-y-2 list-disc">
          {feedbackList.map((item, index) => (
            <li className='text-sm sm:text-base' key={index}>{item}</li>
          ))}
        </ul>
        <div className="mt-8">
          <Button size="xl" className="">
            Revise Your Application
          </Button>
        </div>

    </div>
  );
};

export default Feedback;
