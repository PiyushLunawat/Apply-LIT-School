import React from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const ParentalInformation: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center '>Parental Information</Badge>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="fatherFirstName" className="text-base font-normal pl-3">Father's First Name</Label>
          <Input id="fatherFirstName" placeholder="John" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="fatherLastName" className="text-base font-normal pl-3">Father's Last Name</Label>
          <Input id="fatherLastName" placeholder="Doe" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="fatherContact" className="text-base font-normal pl-3">Father's Contact No.</Label>
          <Input id="fatherContact" placeholder="+91 00000 00000" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="fatherOccupation" className="text-base font-normal pl-3">Father's Occupation</Label>
          <Input id="fatherOccupation" placeholder="Type here" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="motherFirstName" className="text-base font-normal pl-3">Mother's First Name</Label>
          <Input id="motherFirstName" placeholder="John" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="motherLastName" className="text-base font-normal pl-3">Mother's Last Name</Label>
          <Input id="motherLastName" placeholder="Doe" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="motherContact" className="text-base font-normal pl-3">Mother's Contact No.</Label>
          <Input id="motherContact" placeholder="+91 00000 00000" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="motherOccupation" className="text-base font-normal pl-3">Mother's Occupation</Label>
          <Input id="motherOccupation" placeholder="Type here" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl ">
          <Label className="text-base font-normal">Are you financially dependent on your Parents?</Label>
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
        <div className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl ">
          <Label className="text-base font-normal">Have you tried applying for financial aid earlier?</Label>
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

export default ParentalInformation;
