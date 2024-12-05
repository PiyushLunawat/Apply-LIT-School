import React from 'react';

interface ProgressBarProps {
  currentStage: number; // Stage can be 1, 2, or 3
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage }) => {
  return (
    <div className="w-full h-1 sm:h-1.5 flex gap-[2px] overflow-hidden">
      
      <div
        className={`flex-1 h-full rounded-full ${
          currentStage >= 1 ? 'bg-[#00C896]' : 'bg-[#3A3A3A]'
        }`}
      ></div>
      
      <div
        className={`flex-1 h-full rounded-full ${
          currentStage >= 1 ? 'bg-[#00C896]' : 'bg-[#3A3A3A]'
        }`}
      ></div>
      
      <div
        className={`flex-1 h-full rounded-full ${
          currentStage >= 3 ? 'bg-[#00C896]' : 'bg-[#3A3A3A]'
        }`}
      ></div>
    </div>
  );
};

export default ProgressBar;
