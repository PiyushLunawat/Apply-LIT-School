import {
  ArrowLeft,
  CheckCircle,
  CircleCheckBig,
  CircleMinus,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "../../../components/ui/badge";

interface PersonalDetailsProps {
  student: any;
  onSelectTab: (path: string) => void;
}

export default function PersonalDetailsTab({
  student,
  onSelectTab,
}: PersonalDetailsProps) {
  const latestCohort =
    student?.appliedCohorts?.[student?.appliedCohorts.length - 1];
  const studentDetails = latestCohort?.applicationDetails?.studentDetails;
  const previousEducation = studentDetails?.previousEducation;
  const workExperience = studentDetails?.workExperience;
  const emergencyContact = studentDetails?.emergencyContact;
  const parentInformation = studentDetails?.parentInformation;
  const financialInformation = studentDetails?.financialInformation;

  return (
    <div className="px-4 py-8 sm:p-[52px] space-y-8 text-white">
      <div className="flex flex-row sm:flex-col gap-4 items-center sm:items-start">
        <ArrowLeft
          className="w-6 h-6 cursor-pointer"
          onClick={() => onSelectTab("")}
        />
        <Badge className="text-sm w-fit border-[#FF791F] text-[#FF791F] bg-[#FF791F]/10">
          Personal and General Details
        </Badge>
      </div>
      {/* Personal Details */}
      <div className="columns-1 lg:columns-2 space-y-6 gap-6">
        <Card className="bg-[#64748B1F] break-inside-avoid rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Personal Details
          </CardTitle>
          <CardContent className="px-6 py-1">
            <div className="flex items-center border-b border-gray-700 gap-4">
              {/* Profile Image */}
              {student?.profileUrl && (
                <div className="w-12 h-12 relative">
                  <img
                    src={student?.profileUrl}
                    alt="Profile Image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              {/* Full Name */}
              <div className="flex flex-col gap-2 py-4">
                <div className="text-xs sm:text-sm font-light">Full Name</div>
                <div className="text-base sm:text-xl">
                  {student
                    ? `${student?.firstName} ${student?.lastName}`
                    : "--"}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Email
              </div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">
                  {student?.email || "--"}
                </div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>

            {/* Contact No. */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Contact No.
              </div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">
                  {student?.mobileNumber || "--"}
                </div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Date of Birth
              </div>
              <div className="text-base sm:text-xl">
                {student?.dateOfBirth
                  ? new Date(student?.dateOfBirth).toLocaleDateString()
                  : "--"}
              </div>
            </div>

            {/* LinkedIn ID */}
            {student?.linkedInUrl && (
              <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
                <div className="text-xs sm:text-sm font-light text-muted-foreground">
                  LinkedIn ID
                </div>
                <div className="text-base sm:text-xl">
                  {student?.linkedInUrl || "--"}
                </div>
              </div>
            )}

            {/* Instagram ID */}
            {student?.instagramUrl && (
              <div className="flex flex-col gap-2 py-4">
                <div className="text-xs sm:text-sm font-light text-muted-foreground">
                  Instagram ID
                </div>
                <div className="text-base sm:text-xl">
                  {student?.instagramUrl || "--"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parental Information */}
        <Card className="bg-[#64748B1F] break-inside-avoid rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Parental Information
          </CardTitle>
          <CardContent className="px-6 py-1">
            {/* Father’s Name */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Father’s Full Name
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father?.firstName
                  ? `${parentInformation?.father?.firstName} ${parentInformation?.father?.lastName}`
                  : "--"}
              </div>
            </div>

            {/* Father’s Contact */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Father's Contact No.
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father?.contactNumber || "--"}
              </div>
            </div>

            {/* Father’s Occupation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Father's Occupation
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.father?.occupation || "--"}
              </div>
            </div>

            {/* Mother’s Name */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Mother’s Full Name
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother?.firstName
                  ? `${parentInformation?.mother?.firstName} ${parentInformation?.mother?.lastName}`
                  : "--"}
              </div>
            </div>

            {/* Mother’s Contact */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Mother’s Contact No.
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother?.contactNumber || "--"}
              </div>
            </div>

            {/* Mother’s Occupation */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Mother’s Occupation
              </div>
              <div className="text-base sm:text-xl">
                {parentInformation?.mother?.occupation || "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Education */}
        <Card className="bg-[#64748B1F] break-inside-avoid rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Previous Education
          </CardTitle>
          <CardContent className="px-6 py-1">
            {/* Name Of Institution */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Institute Name
              </div>
              <div className="flex justify-between items-center">
                <div className="text-base sm:text-xl">
                  {previousEducation?.nameOfInstitution || "--"}
                </div>
                <CheckCircle className="h-4 w-4 text-[#00CC92]" />
              </div>
            </div>

            {/* Highest Level Of Education */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Highest Level of Education
              </div>
              <div className="text-base sm:text-xl">
                {previousEducation?.highestLevelOfEducation || "--"}
              </div>
            </div>

            {/* Field Of Study */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Field of Study (Your Major)
              </div>
              <div className="text-base sm:text-xl">
                {previousEducation?.fieldOfStudy || "--"}
              </div>
            </div>

            {/* Year Of Graduation */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Year of Graduation
              </div>
              <div className="text-base sm:text-xl">
                {previousEducation?.yearOfGraduation || "--"}
              </div>
            </div>

            {/* Work Experience */}
            {workExperience?.isExperienced ? (
              <div className="flex flex-col gap-2 py-4">
                <div className="bg-[#64748B33] px-4 py-1 w-fit rounded-full text-xs sm:text-sm font-light">
                  Work Experience
                </div>
                <div className="text-base sm:text-xl font-medium">
                  {workExperience?.nameOfCompany}
                </div>
                <div className=" flex gap-2 items-center text-sm sm:text-base">
                  <span>{workExperience?.jobDescription}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{workExperience?.experienceType}</span>
                </div>
                <div className="text-xs sm:text-sm">
                  {workExperience?.duration}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-4">
                <div className="text-xs sm:text-sm font-light text-muted-foreground">
                  Work Experience
                </div>
                <div className="text-base sm:text-xl">--</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact Details */}
        <Card className="bg-[#64748B1F] break-inside-avoid rounded-xl text-white">
          <CardTitle className="bg-[#64748B33] p-6 text-2xl font-medium">
            Emergency Contact Details
          </CardTitle>
          <CardContent className="px-6 py-1">
            {/* Emergency Contact Name */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                First Name
              </div>
              <div className="text-base sm:text-xl">
                {emergencyContact
                  ? `${emergencyContact?.firstName} ${emergencyContact?.lastName}`
                  : "--"}
              </div>
            </div>

            {/* Emergency Contact relationship */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Relationship with Contact
              </div>
              <div className="text-base sm:text-xl">
                {emergencyContact?.relationshipWithStudent || "--"}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Contact No.
              </div>
              <div className="text-base sm:text-xl">
                {emergencyContact?.contactNumber || "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* financial Information */}
        <Card className="bg-[#64748B1F] break-inside-avoid rounded-xl text-white">
          <CardContent className="px-6 py-1">
            {/* Financial Aid */}
            <div className="flex flex-col gap-2 font-medium py-4">
              {financialInformation?.hasAppliedForFinancialAid ? (
                <div className="flex gap-2 items-center">
                  <CircleCheckBig className="w-3 h-3" />
                  <span className="flex-1">
                    Has tried applying for financial aid earlier
                  </span>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <CircleMinus className="w-3 h-3" />
                  <span className="flex-1">
                    Has not tried applying for any financial aid earlier
                  </span>
                </div>
              )}
            </div>
            {/* Loan Applicant */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Loan Applicant
              </div>
              <div className="text-base sm:text-xl capitalize">
                {financialInformation?.loanApplicant || "--"}
              </div>
            </div>

            {/* Loan Type */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Loan Type
              </div>
              <div className="text-base sm:text-xl capitalize">
                {financialInformation?.loanType || "--"}
              </div>
            </div>

            {/* Loan Amount */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Loan Amount
              </div>
              <div className="text-base sm:text-xl">
                {financialInformation?.requestedLoanAmount
                  ? `INR ${financialInformation?.requestedLoanAmount}`
                  : "--"}
              </div>
            </div>

            {/* CIBIL Score */}
            <div className="flex flex-col gap-2 border-b border-gray-700 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                CIBIL Score
              </div>
              <div className="text-base sm:text-xl">
                {financialInformation?.cibilScore || "--"}
              </div>
            </div>

            {/* Annual family Income */}
            <div className="flex flex-col gap-2 py-4">
              <div className="text-xs sm:text-sm font-light text-muted-foreground">
                Annual family Income
              </div>
              <div className="text-base sm:text-xl">
                {financialInformation?.annualFamilyIncome
                  ? `INR ${financialInformation?.annualFamilyIncome}`
                  : "--"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
