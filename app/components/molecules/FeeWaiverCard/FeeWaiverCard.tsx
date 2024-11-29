import React from 'react';

interface FeeWaiverCardProps {
  title: string;
  waiverAmount: string;
  clearanceRange: string;
  desc: string;
  color: string;
  bg: string
}

const FeeWaiverCard: React.FC<FeeWaiverCardProps> = ({ title, waiverAmount, clearanceRange, desc, color, bg }) => {

console.log("acaac",color);


  return (
    <div className={`flex flex-col p-4 bg-[#09090B] border rounded-xl text-white space-y-6`}>
      <div className="flex flex-col gap-2">
        <div className={`text-[#${color}] text-base font-medium`}>
          {title}
        </div>
        <div className="text-sm">{desc}</div>
      </div>
      <div
        className={`flex px-4 py-3 justify-between items-center rounded-[10px] bg-[#${bg}] text-[#${color}]`} >
        <div className="text-base font-semibold">{waiverAmount} Fee Waiver</div>
        <div className="text-base font-normal">{clearanceRange} challenge clearance</div>
      </div>
    </div>
  );
};

export default FeeWaiverCard;
