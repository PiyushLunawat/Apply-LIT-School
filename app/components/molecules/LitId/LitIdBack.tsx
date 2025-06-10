import { QRCodeCanvas } from "qrcode.react";
import React from "react";

interface LitIdBackProps {
  data: any;
}

const LitIdBack: React.FC<LitIdBackProps> = ({ data }) => {
  const latestCohort = data?.appliedCohorts?.[data?.appliedCohorts.length - 1];
  const cohortDetails = latestCohort?.cohortId;
  const applicationDetails = latestCohort?.applicationDetails;

  const vCardParams = new URLSearchParams({
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    phone: data?.mobileNumber || "",
    email: data?.email || "",
    profileUrl: data?.profileUrl || "",
    linkedIn: data?.linkedInUrl || "",
    instagram: data?.instagramUrl || "",
  });

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://apply-lit-school.vercel.app";
  // Construct the dynamic vCard URL with the user ID and query params
  const vCardURL = `${baseUrl}/id/${data?._id}?${vCardParams.toString()}`;

  return (
    <div className="w-[400px] h-[590.11px] pb-[0.11px] bg-white flex-col justify-center items-center inline-flex">
      <div className="self-stretch h-[590px] px-6 py-5 flex-col justify-between items-start inline-flex">
        <div className="self-stretch flex pt-[50px] justify-center items-center gap-2.5 inline-flex">
          <div className="w-[168px] h-[168px] bg-[#ededed] rounded-xl">
            <QRCodeCanvas value={vCardURL} size={168} />
          </div>
        </div>
        <div className="self-stretch max-h-[302px] flex-col justify-center items-start gap-4 flex">
          <img src="/assets/images/id-icon.svg" className="w-[48px] h-[54px]" />
          <div className="flex-col justify-start items-start gap-2 flex">
            {applicationDetails?.studentDetails?.parentInformation?.father
              ?.firstName !== "" ? (
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                Father’s Name:{" "}
                {(applicationDetails?.studentDetails?.parentInformation?.father
                  ?.firstName || "-") +
                  " " +
                  (applicationDetails?.studentDetails?.parentInformation?.father
                    ?.lastName || "-")}
              </div>
            ) : (
              <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
                Mother's Name:{" "}
                {(applicationDetails?.studentDetails?.parentInformation?.mother
                  ?.firstName || "-") +
                  " " +
                  (applicationDetails?.studentDetails?.parentInformation?.mother
                    ?.lastName || "-")}
              </div>
            )}
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Emergency Contact:{" "}
              {applicationDetails?.studentDetails?.emergencyContact
                ?.contactNumber || "--"}
            </div>
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Blood Group: {data?.bloodGroup}
            </div>
          </div>
          <div className="flex-col justify-start items-start gap-2 flex mt-2.5">
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Address:{" "}
              {applicationDetails?.studentDetails?.currentAddress
                ?.streetAddress +
                ", " +
                applicationDetails?.studentDetails?.currentAddress?.city +
                ", " +
                applicationDetails?.studentDetails?.currentAddress?.postalCode}
            </div>
          </div>
          <div className="flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              Issued On:{" "}
              {new Date(cohortDetails?.startDate).toLocaleDateString()}
            </div>
            <div className="self-stretch text-[#4f4f4f] text-sm font-semibold font-['Geist'] leading-tight">
              Expiry Date:{" "}
              {new Date(cohortDetails?.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              www.litschool.in
            </div>
            <img src="/assets/images/id-star.svg" className="w-1.5 h-1.5 " />
            <div className="text-[#4f4f4f] text-sm font-normal font-['Geist'] leading-tight">
              info@litschool.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitIdBack;
