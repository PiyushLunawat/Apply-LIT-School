import React from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const PreviousEducation: React.FC = () => {
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
          <RadioGroup defaultValue="male" className="flex space-x-6 mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yesWorkExperience" id="yesWorkExperience" />
            <Label htmlFor="yesWorkExperience" className="text-base font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="noWorkExperience" id="noWorkExperience" />
            <Label htmlFor="noWorkExperience" className="text-base font-normal">No</Label>
          </div>
        </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default PreviousEducation;
