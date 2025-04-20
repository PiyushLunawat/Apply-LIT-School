import { HandMetal } from 'lucide-react';
import React from 'react';

interface JudgementCriteriaCardProps {
  index: number
  criteria: string;
  maxPoint: string;
  desc: string;
}

const JudgementCriteriaCard: React.FC<JudgementCriteriaCardProps> = ({ index, criteria, maxPoint, desc }) => {

  return (    
    <div key={index} className="px-4 py-6 rounded-xl border border-[#2C2C2C]">
      <div className='flex justify-between items-center mb-4 sm:mb-6'>
        <div className="flex gap-2 items-center text-base sm:text-lg font-semibold ml-1 "><HandMetal className='rotate-90 w-4'/>{criteria}</div>
        <div className='text-sm font-normal text-muted-foreground'>{maxPoint} Points</div>
      </div>  
      {desc ?
        <div className="text-sm sm:text-base font-normal">
          {desc}
        </div> :
        <div className="text-sm sm:text-base text-muted-foreground font-normal">
          No Description Shared
        </div>
        }
    </div>
  );
};

export default JudgementCriteriaCard;
