import { AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Badge } from '~/components/ui/badge';
import { Mail, Phone, Linkedin, Instagram, Calendar, Camera } from 'lucide-react';

const PersonalDetails: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("creatorpreneur");
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div  className='flex-1 space-y-1 relative'>
              <CheckCircle className="text-[#00CC92] absolute left-3 top-[52px] w-5 h-5 " />
              <Label htmlFor="email" className="text-base font-normal pl-3">Email</Label>
              <Input id="email" type="email" placeholder="johndoe@gmail.com" className='pl-10' />
              <Mail className="absolute right-3 top-12 w-5 h-5 " />
            </div>
            <div className="flex-1 space-y-1 relative">
              <Phone className="absolute left-3 top-[52px] w-5 h-5 " />
              <Label htmlFor="contact" className="text-base font-normal pl-3">Contact No.</Label>
              <Input id="contact" type="tel" placeholder="+91 95568 97688" className='pl-10'/>
              <Button size='sm' className='absolute right-3 top-10 rounded-full px-4 bg-[#00CC92] '>Verify</Button>
            </div>
          </div>

          {/* Date of Birth and Course of Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex-1 space-y-1 relative">
              <Label htmlFor="dob" className="text-base font-normal pl-3">Date of Birth</Label>
              <Input id="dob" type="text" placeholder="08 March, 2000" />
              <Calendar className="absolute right-3 top-12 w-5 h-5" />
            </div>
            <div className='flex-1 space-y-1'>
              <Label htmlFor="course" className="text-base font-normal pl-3">You are Currently a</Label>
              <Input id="dob" type="text" placeholder="College Student" />
            </div>
          </div>
        </div>
      </div>

      {/* Course of Interest */}
      <div className="flex flex-col sm:flex-row gap-2 ">
        <div className='flex-1 space-y-1'>
          <Label htmlFor="course" className='text-sm font-normal pl-3'>Course of Interest</Label>
          <Select onValueChange={(value) => setSelectedCourse(value)}>
            <SelectTrigger className="">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creatorpreneur">Creatorpreneur</SelectItem>
              <SelectItem value="creatormarketer">Creator Marketer</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="form-alert" className='flex gap-1 items-center text-sm text-[#00A3FF] font-normal pl-3 mt-1'>
            Your application form will be in line with the course of your choice.
          </Label>
        </div>

        <div className='flex-1 space-y-1'>
          <Label htmlFor="course" className='text-sm font-normal pl-3'>Select Cohort</Label>
          <Select >
            <SelectTrigger defaultValue='Apr' className="">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apr">Apr, 2025 (Evening: 4:30 AM - 8:00 PM), Bangalore</SelectItem>
              <SelectItem value="Feb">Feb, 2025 (Morning: 10:30 AM - 1:00 PM), Bangalore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LinkedIn and Instagram IDs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex-1 space-y-1 relative">
          <Label htmlFor="linkedin" className="text-base font-normal pl-3">Your LinkedIn ID (Not Compulsory)</Label>
          <Input id="linkedin" placeholder="John Doe" />
          <Linkedin className="absolute right-3 top-12 w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1 relative">
          <Label htmlFor="instagram" className="text-base font-normal pl-3">Your Instagram ID (Not Compulsory)</Label>
          <Input id="instagram" placeholder="@JohnDoe" />
          <Instagram className="absolute right-3 top-12 w-5 h-5" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
