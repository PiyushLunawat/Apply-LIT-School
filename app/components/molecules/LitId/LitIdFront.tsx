import React from 'react';

interface LitIdFrontProps {
  data: any;
}

const LitIdFront: React.FC<LitIdFrontProps> = ({ data }) => {
  
  return (
    <div className="w-[400px] h-[590.11px] bg-white !border flex-col justify-center items-center inline-flex">
      <div className="self-stretch w-[398px] ">
        <img
          src={data?.profileUrl || "https://github.com/shadcn.png"}
          className="object-cover w-[398px] h-[355px]"
          alt="Profile"
        />
      </div>

      <div className="px-4 pb-3 bg-white h-[250px] border-x w-[400px] flex-col justify-between items-start inline-flex">
        <div className="h-[108px] flex-col justify-start items-start gap-3 flex">
          <div className="p-2.5 bg-white rounded-[100px] border border-[#d9d9d9] justify-center items-center gap-2.5 inline-flex" >
            <div className="text-zinc-950 text-base font-medium font-['Geist'] leading-snug">
              LIT{data?.program?.prefix || 'NBA'}085
            </div>
          </div>
          <div className="self-stretch h-[63px] pl-1 flex-col justify-start items-start gap-3 flex">
            <div className="self-stretch text-zinc-950 text-2xl font-semibold font-['Geist'] leading-[33.60px]">
              {data ? `${data?.firstName} ${data?.lastName}` : '--'}
            </div>
            <div className="self-stretch h-[30px] flex-col justify-start items-start gap-2 flex">
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                {data?.email || '--'}
              </div>
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                {data?.mobileNumber || '--'}
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch -[400px] px-1 justify-between items-center inline-flex">
          <div className="text-zinc-950 text-base font-semibold font-['Geist'] leading-snug">
            The LIT School
          </div>
          <div className="justify-start items-center gap-1 flex">
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">Learn</div>
            <img src="/assets/images/id-star.svg" className="w-1.5 h-1.5 " />
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">Innovate</div>
            <img src="/assets/images/id-star.svg" className="w-1.5 h-1.5 " />
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">Transform</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitIdFront;
