import React from 'react';

interface LitIdBackProps {
  data: any;
  ScanUrl: string;
}

const LitIdBack: React.FC<LitIdBackProps> = ({ data, ScanUrl }) => {
  return (
    <div className="w-[400px] h-[590.11px] pb-[0.11px] bg-white flex-col justify-center items-center inline-flex">
      <div className="self-stretch h-[590px] flex-col justify-start items-start inline-flex">
        <div className="self-stretch px-2.5 pt-20 pb-10 justify-center items-center gap-2.5 inline-flex">
          <div className="w-[168px] h-[168px] bg-[#ededed] rounded-xl"></div>
        </div>
        <div className="self-stretch h-[302px] p-6 flex-col justify-start items-start gap-5 flex">
          <div className="w-[48.36px] h-[54px] relative">
            <div className="w-[16.12px] h-[33.98px] left-0 top-[20.02px] absolute"></div>
          </div>
          <div className="self-stretch h-[50px] flex-col justify-start items-start gap-2.5 flex">
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Father’s Name: {data?.studentDetails?.parentInformation?.father?.firstName + ' ' + data?.studentDetails?.parentInformation?.father?.lastName || '--'}
            </div>
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Emergency Contact: {data?.studentDetails?.emergencyContact?.contactNumber || '--'}
            </div>
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Blood Group: {data?.bloodGroup}
            </div>
          </div>
          <div className="self-stretch h-[30px] flex-col justify-start items-start gap-2.5 flex mt-2.5">
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Address: {data?.studentDetails?.currentAddress?.streetAddress + ', ' + data?.studentDetails?.currentAddress?.city + ', ' + data?.studentDetails?.currentAddress?.postalCode}
            </div>
          </div>
          <div className="self-stretch h-[30px] flex-col justify-start items-start gap-2.5 flex">
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Issued On: {new Date(data?.cohort?.startDate).toLocaleDateString()}
            </div>
            <div className="self-stretch text-[#4f4f4f] text-sm font-semibold font-['Geist'] leading-tight">
              Expiry Date: {new Date(data?.cohort?.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="self-stretch justify-start items-center gap-2.5 inline-flex">
            <div className="text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">www.litschool.in</div>
            <div className="w-[6.17px] h-1.5 justify-center items-center flex"></div>
            <div className="text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">info@litschool.in</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitIdBack;
