import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const PreviousEducation: React.FC = () => {
  const [experienceType, setExperienceType] = useState<string | null>(null);
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean | null>(null);

  return (
    <div className="flex flex-col gap-6 mt-8">
      <Badge size="xl" className='flex-1 bg-[#FF791F]/[0.2] text-[#FF791F] text-center '>Previous Education</Badge>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="educationLevel" className="text-base font-normal pl-3">Highest Level of Education Attained</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highschool">High School</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="fieldOfStudy" className="text-base font-normal pl-3">Field of Study (Your Major)</Label>
          <Input id="fieldOfStudy" placeholder="Type here" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="institutionName" className="text-base font-normal pl-3">Name of Institution</Label>
          <Input id="institutionName" placeholder="Type here" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="graduationYear" className="text-base font-normal pl-3">Year of Graduation</Label>
          <Input id="graduationYear" placeholder="MM/YYYY" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1 pl-3">
          <Label className="text-base font-normal">Do you have any work experience?</Label>
          <RadioGroup className="flex space-x-6 mt-2" onValueChange={(value) => setHasWorkExperience(value === 'yes')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yesWorkExperience" />
              <Label htmlFor="yesWorkExperience" className="text-base font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="noWorkExperience" />
              <Label htmlFor="noWorkExperience" className="text-base font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Conditional Work Experience Section */}
      {hasWorkExperience && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="experiencetype" className="text-base font-normal pl-3">Select Your Latest Work Experience Type</Label>
              <Select onValueChange={(value) => setExperienceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="job/service" className="text-base font-normal pl-3">Latest Job/Service Description</Label>
              <Input id="job/service" placeholder="Type here" />
            </div>
          </div>

          {/* Conditional Fields Based on Experience Type */}
          {experienceType === 'employee' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company (Latest or Current)</Label>
                <Input id="companyName" placeholder="Type here" />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="workDuration" className="text-base font-normal pl-3">Apx. Duration of Work</Label>
                <Input id="workDuration" placeholder="MM/YYYY - MM/YYYY" />
              </div>
            </div>
          )}

          {experienceType === 'business' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company</Label>
                <Input id="companyName" placeholder="Type here" />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="companyStartDate" className="text-base font-normal pl-3">When Did You Start Your Company?</Label>
                <Input id="companyStartDate" placeholder="MM/YYYY" />
              </div>
            </div>
          )}

          {experienceType === 'freelancer' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="durationOfWork" className="text-base font-normal pl-3">Apx. Duration of Work</Label>
                <Input id="durationOfWork" placeholder="MM/YYYY - MM/YYYY" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PreviousEducation;
