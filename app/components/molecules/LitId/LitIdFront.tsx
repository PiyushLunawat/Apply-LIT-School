import React from "react";
import { getEnvValue } from "~/atoms/envAtoms";

const awsUrl = getEnvValue("REMIX_AWS_BASE_URL");
interface LitIdFrontProps {
  data: any;
}

const LitIdFront: React.FC<LitIdFrontProps> = ({ data }) => {
  const latestCohort = data?.appliedCohorts?.[data?.appliedCohorts.length - 1];

  return (
    <div className="w-[400px] h-[590.11px] pb-[0.11px] bg-white flex-col justify-center items-center inline-flex">
      <div className="self-stretch w-[400px] ">
        <img
          src={
            `${awsUrl}/${data?.profileUrl}` ||
            "/assets/images/profile-placeholder.svg"
          }
          className="object-cover w-[400px] h-[360px]"
          alt="Profile"
        />
      </div>

      <div className="px-6 py-5 bg-white h-[230px] w-[400px] flex-col justify-between items-start inline-flex">
        <div className="h-[108px] flex-col justify-start items-start gap-3 flex">
          <div className="p-2.5 bg-white rounded-[100px] border border-[#d9d9d9] justify-center items-center gap-2.5 inline-flex">
            <div className="text-zinc-950 text-base font-medium font-['Geist'] leading-snug">
              {latestCohort?.applicationDetails?.applicationId || "LITXX01"}
            </div>
          </div>
          <div className="self-stretch h-[63px] pl-1 flex-col justify-start items-start gap-3 flex">
            <div className="self-stretch text-zinc-950 text-2xl font-semibold font-['Geist'] leading-[33.60px]">
              {data ? `${data?.firstName} ${data?.lastName}` : "--"}
            </div>
            <div className="self-stretch h-[30px] flex-col justify-start items-start gap-2 flex">
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                {data?.email || "--"}
              </div>
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                {data?.mobileNumber || "--"}
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch -[400px] px-1 justify-between items-center inline-flex">
          <div className="text-zinc-950 text-base font-semibold font-['Geist'] leading-snug">
            The LIT School
          </div>
          <div className="justify-start items-center gap-1 flex">
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">
              Learn
            </div>
            <img src="/assets/images/id-star.svg" className="w-1.5 h-1.5 " />
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">
              Innovate
            </div>
            <img src="/assets/images/id-star.svg" className="w-1.5 h-1.5 " />
            <div className="text-zinc-950 text-base font-normal font-['Geist'] leading-snug">
              Transform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitIdFront;
