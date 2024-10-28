import React from 'react';

interface FeeWaiverCardProps {
  title: string;
  waiverAmount: string;
  clearanceRange: string;
  color: string;
}

const FeeWaiverCard: React.FC<FeeWaiverCardProps> = ({ title, waiverAmount, clearanceRange, color }) => {
  return (
    <div className={`flex flex-col p-4 bg-[#09090B] border ${color} rounded-xl text-white w-[275px] space-y-4 `}>
      <div className={`${color} text-2xl font-semibold `}>{title}</div>
      <div className="text-2xl test-white">{waiverAmount} Fee Waiver</div>
      <div className="text-base text-muted-foreground">{clearanceRange} challenge clearance</div>
    </div>
  );
};

export default FeeWaiverCard;
