import { DownloadIcon, File, HandMetal } from 'lucide-react';
import React from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component

interface InterviewFeedbackProps {
  feedback: [];
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  feedback
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {feedback?.filter((feedback: any) => feedback?.data && feedback.data.length > 0)
        .map((feedback: any, feedbackIndex: any) => (
          <div key={feedbackIndex} className="p-6 rounded-xl border border-[#2C2C2C]">
            <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/>{feedback?.feedbackTitle}</div>
            <ul className="space-y-2 pl-6 list-disc">
              {feedback?.data.map((criterion: any, criterionIndex: any) => (
                <li key={criterionIndex} className="text-sm pl-3">
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
      ))}
    </div>
  );
};

export default InterviewFeedback;