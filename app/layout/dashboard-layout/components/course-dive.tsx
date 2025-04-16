import { ArrowLeft, CheckCircle, CircleCheckBig, CircleMinus, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { getCurrentStudent } from "~/api/studentAPI";
import { UserContext } from "~/context/UserContext";
import { useContext, useEffect, useState } from "react";
import LitmusTest from "./LitmusTest";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

interface CourseDiveProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function CourseDiveTab({ student, onSelectTab }: CourseDiveProps) {
  const latestCohort = student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const studentDetails = latestCohort?.applicationDetails?.studentDetails;
  const previousEducation = studentDetails?.previousEducation;
  const workExperience = studentDetails?.workExperience;
  const emergencyContact = studentDetails?.emergencyContact;
  const parentInformation = studentDetails?.parentInformation;
  const financialInformation = studentDetails?.financialInformation;
  
  return (
    <div className="p-4 sm:p-6 space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => onSelectTab("")}/>
        <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
          Course Dive
        </Badge>
      </div>
      {/* Personal Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#64748B1F] rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Personal Details
          </CardTitle>
          <CardContent className="px-6 ">
            <div className="flex md:flex-row flex-col items-center border-b border-gray-700 gap-4 sm:gap-6">
              {student?.profileUrl &&
                <div className="w-12 h-12 relative">
                  <img
                    src={student?.profileUrl}
                    alt="Profile Image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              }
              {/* Full Name */}
              <div className="flex flex-col gap-2 py-4">
                <div className="text-xs sm:text-sm font-light">Full Name</div>
                <div className="text-base sm:text-xl">
                  {student ? `${student?.firstName} ${student?.lastName}` : "--"}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Email</div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">{student?.email || "--"}</div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>

            {/* Contact No. */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Contact No.</div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">{student?.mobileNumber || "--"}</div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>
  
            {/* Date of Birth */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Date of Birth</div>
              <div className="text-base sm:text-xl">
                {student?.dateOfBirth ? new Date(student?.dateOfBirth).toLocaleDateString() : "--"}
              </div>
            </div>
  
            {/* LinkedIn ID */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">LinkedIn ID</div>
              <div className="text-base sm:text-xl">
                {student?.linkedInUrl || "--"}
              </div>
            </div>

            {/* Instagram ID */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light">Instagram ID</div>
              <div className="text-base sm:text-xl">
                {student?.instagramUrl || "--"}
              </div>
            </div>
          </CardContent>
        </Card>
        
        

        {/* Previous Education */}
        <Card className="bg-[#64748B1F] rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Previous Education
          </CardTitle>
          <CardContent className="px-6 py-6">
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Institute Name</div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">{previousEducation?.nameOfInstitution || "--"}</div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Highest Level of Education</div>
              <div className="text-base sm:text-xl">
                {previousEducation?.highestLevelOfEducation || "--"}
              </div>
            </div>

            {/* Contact No. */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
            <div className="text-xs sm:text-sm font-light">Field of Study (Your Major)</div>
              <div className="text-base sm:text-xl">
                {previousEducation?.fieldOfStudy || "--"}
              </div>
            </div>
  
            {/* Date of Birth */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Year of Graduation</div>
              <div className="text-base sm:text-xl">
                {previousEducation?.yearOfGraduation || "--"}
              </div>
            </div>
  
            {/* LinkedIn ID */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Work Experience</div>
              <div className="text-base sm:text-xl">
                {workExperience?.isExperienced || "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parental Information */}
        <Card className="bg-[#64748B1F] rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Parental Information
          </CardTitle>
          <CardContent className="px-6 ">
            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Father’s Full Name</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father ? `${parentInformation?.father?.firstName} ${parentInformation?.father?.lastName}` : "--"}
              </div>
            </div>

            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Father's Contact No.</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father?.contactNumber || "--"}
              </div>
            </div>

            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Father's Occupation</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father?.occupation || "--"}
              </div>
            </div>
  
            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Mother’s Full Name</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother ? `${parentInformation?.mother?.firstName} ${parentInformation?.mother?.lastName}` : "--"}
              </div>
            </div>
  
            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Mother’s Contact No.</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother?.contactNumber || "--"}
              </div>
            </div>

            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light">Mother’s Occupation</div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother?.occupation || "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Emergency Contact Details */}
        <Card className="bg-[#64748B1F] rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Emergency Contact Details
          </CardTitle>
          <CardContent className="px-6 "> 
            {/* Date of Birth */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">First Name</div>
              <div className="text-base sm:text-xl">
                {emergencyContact ? `${emergencyContact?.firstName} ${emergencyContact?.lastName}` : "--"}
              </div>
            </div>
  
            {/* LinkedIn ID */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light">Relationship with Contact</div>
              <div className="text-base sm:text-xl">
                {emergencyContact?.relationshipWithStudent || "--"}
              </div>
            </div>

            {/* Instagram ID */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light">Contact No.</div>
              <div className="text-base sm:text-xl">
                {emergencyContact?.contactNumber || "--"}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Emergency Contact Details */}
        <Card className="bg-[#64748B1F] rounded-xl text-white">
          <CardContent className="px-6 "> 
            {/* Date of Birth */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              {financialInformation.isFinanciallyIndependent ? (
                <div className="pl-3 flex gap-2 items-center">
                  <CircleCheckBig className="w-3 h-3" />
                  Financially independent
                </div>
              ) : (
                <div className="pl-3 flex gap-2 items-center">
                  <CircleMinus className="w-3 h-3" />
                  Financially dependent on Parents
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2  py-4">
              {financialInformation.hasAppliedForFinancialAid ? (
                <div className="pl-3 flex gap-2 items-center">
                  <CircleCheckBig className="w-3 h-3" />
                  Has tried applying for financial aid earlier
                </div>
              ) : (
                <div className="pl-3 flex gap-2 items-center">
                  <CircleMinus className="w-3 h-3" />
                  Has not tried applying for any financial aid earlier
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
