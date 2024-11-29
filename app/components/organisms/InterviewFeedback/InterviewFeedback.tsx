import { DownloadIcon, File, HandMetal } from 'lucide-react';
import React from 'react';
import { Button } from '~/components/ui/button'; // Assuming you have a Button component

interface InterviewFeedbackProps {
  fileName: string; // The file name to display
  status: string;
  strengths: string[]; // Array of strings for Strengths
  weaknesses: string[]; // Array of strings for Weaknesses
  opportunities: string[]; // Array of strings for Opportunities
  threats: string[]; // Array of strings for Threats
  date: string; // Date of review
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  fileName,
  status,
  strengths,
  weaknesses,
  opportunities,
  threats,
  date,
}) => {
  return (
    <div className="h-full " >
    <div className=" px-6" >
    <div className={`relative bg-[#09090b] border border-[#2C2C2C] text-white p-6 sm:p-8 rounded-2xl w-full max-w-[1216px] mx-auto ${status==='rejected' ? ' shadow-[0px_4px_32px_rgba(0,163,255,0.2)]' : 'shadow-[0px_4px_32px_rgba(255,80,61,0.2)]'}`}>

      <div className="flex justify-between items-center mb-8">
        <div className="text-xl sm:text-3xl font-semibold">Interview Feedback</div>
        <div className="text-sm sm:text-base">{date}</div>
      </div>

      {/* SWOT Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Strengths */}
        <div className="p-6 rounded-xl border border-[#2C2C2C] ">
          <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/> Strengths</div>
          <ul className="space-y-2 pl-6 list-disc">
            {strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-xl border border-[#2C2C2C] ">
          <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/> Weaknesses</div>
          <ul className="space-y-2 pl-6 list-disc">
            {weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="p-6 rounded-xl border border-[#2C2C2C] ">
          <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/> Opportunities</div>
          <ul className="space-y-2 pl-6 list-disc">
            {opportunities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="p-6 rounded-xl border border-[#2C2C2C] ">
          <div className="flex gap-2 items-center text-lg font-semibold ml-1 mb-2"><HandMetal className='rotate-90 w-4'/> Threats</div>
          <ul className="space-y-2 pl-6 list-disc">
            {threats.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    

    </div>
    </div>
    </div>
  );
};

export default InterviewFeedback;