import { AlertCircle } from 'lucide-react';
import React from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Badge } from '~/components/ui/badge';
import { Mail, Phone, Linkedin, Instagram, Calendar, Camera } from 'lucide-react';

const PersonalDetails: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
      <Badge size="xl" className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>Personal Details</Badge>
      <div className="flex gap-6">
        <div className="w-[232px] h-[285px] bg-[#1F1F1F] p-4 sm:p-6 flex items-center justify-center rounded-xl text-sm ">
          <div className="text-center text-muted-foreground">
            <Camera className="mx-auto mb-2 w-8 h-8" />
            <p>Upload a Passport size Image of Yourself. Ensure that your face covers 60% of this picture.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-4">
          {/* Full Name */}
          <div className='flex-1 space-y-1'>
            <Label htmlFor="fullName" className="text-base font-normal pl-3">Full Name</Label>
            <Input id="fullName" placeholder="John Doe" />
          </div>

          {/* Email and Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div  className='flex-1 space-y-1 relative'>
              <Label htmlFor="email" className="text-base font-normal pl-3">Email</Label>
              <Input id="email" type="email" placeholder="johndoe@gmail.com" />
              <Mail className="absolute right-3 top-10 w-5 h-5 " />
            </div>
            <div className="flex-1 space-y-1 relative">
              <Label htmlFor="contact" className="text-base font-normal pl-3">Contact No.</Label>
              <Input id="contact" type="tel" placeholder="+91 95568 97688" />
              <Phone className="absolute right-3 top-10 w-5 h-5 " />
            </div>
          </div>

          {/* Date of Birth and Course of Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex-1 space-y-1 relative">
              <Label htmlFor="dob" className="text-base font-normal pl-3">Date of Birth</Label>
              <Input id="dob" type="text" placeholder="08 March, 2000" />
              <Calendar className="absolute right-3 top-10 w-5 h-5" />
            </div>
            <div className='flex-1 space-y-1'>
              <Label htmlFor="course" className="text-base font-normal pl-3">Course of Interest</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Creator Marketer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creator-marketer">Creator Marketer</SelectItem>
                  <SelectItem value="creatorpreneur">Creatorpreneur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn and Instagram IDs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex-1 space-y-1 relative">
          <Label htmlFor="linkedin" className="text-base font-normal pl-3">Your LinkedIn ID (Not Compulsory)</Label>
          <Input id="linkedin" placeholder="John Doe" />
          <Linkedin className="absolute right-3 top-10 w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1 relative">
          <Label htmlFor="instagram" className="text-base font-normal pl-3">Your Instagram ID (Not Compulsory)</Label>
          <Input id="instagram" placeholder="@JohnDoe" />
          <Instagram className="absolute right-3 top-10 w-5 h-5" />
        </div>
      </div>

      {/* Gender Selection */}
      <div  className='flex-1 space-y-1 pl-3'>
        <Label className="text-base font-normal">Select Your Gender</Label>
        <RadioGroup defaultValue="male" className="flex space-x-6 mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="text-base font-normal">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="text-base font-normal">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other" className="text-base font-normal">Other</Label>
          </div>
        </RadioGroup>
      </div>

      <div className='flex-1 space-y-1'>
        <Label htmlFor="address" className="text-base font-normal pl-3">Your Current Address</Label>
        <Input id="address" placeholder="Street Address" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className='flex-1 space-y-1'>
          <Label htmlFor="city" className="text-base font-normal pl-3">City, State</Label>
          <Input id="city" placeholder="City, State" />
        </div>
        <div className='flex-1 space-y-1'>
          <Label htmlFor="zipcode" className="text-base font-normal pl-3">Postal/Zip Code</Label>
          <Input id="zipcode" placeholder="Postal/Zip Code" />
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
