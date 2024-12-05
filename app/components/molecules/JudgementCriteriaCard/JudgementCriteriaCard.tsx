import { HandMetal } from 'lucide-react';
import React from 'react';

interface JudgementCriteriaCardProps {
  criteria: string;
  maxPoint: string;
  desc: string;
}

const JudgementCriteriaCard: React.FC<JudgementCriteriaCardProps> = ({ criteria, maxPoint, desc }) => {

  return (    
    <div className="p-6 rounded-xl border border-[#2C2C2C]">
      <div className='flex justify-between items-center mb-2'>
        <div className="flex gap-2 items-center text-lg font-semibold ml-1 "><HandMetal className='rotate-90 w-4'/>{criteria}</div>
        <div className='text-base font-normal text-muted-foreground'>{maxPoint} Points</div>
      </div>  
      <div className="text-base font-normal">
        {desc}
      </div>
    </div>
  );
};

export default JudgementCriteriaCard;
