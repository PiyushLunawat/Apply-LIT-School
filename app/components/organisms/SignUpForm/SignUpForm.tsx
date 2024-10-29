import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useNavigate } from '@remix-run/react';

interface SignUpFormProps {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>; // Passing the setShowOtp function from parent
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ setShowOtp }) => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const handleLoginClick = () => {
    navigate('../login');
  };

  const handleVerifyClick = () => {
    setShowOtp(true); // This will set showOtp to true in the parent component
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex flex-col sm:flex-row gap-2 ">
        <div className='flex-1 space-y-1'>
          <Label htmlFor="firstName" className='text-sm font-normal pl-3'>First Name</Label>
          <Input id="firstName" placeholder="John" />
        </div>
        <div className='flex-1 space-y-1'>
          <Label htmlFor="lastName" className='text-sm font-normal pl-3'>Last Name</Label>
          <Input id="lastName" placeholder="Doe" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 ">
        <div className='flex-1 space-y-1'>
          <Label htmlFor="email" className='text-sm font-normal pl-3'>Email</Label>
          <Input id="email" type="email" placeholder="johndoe@gmail.com" />
          <Label htmlFor="email-error" className='flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3'><AlertCircle className='w-3 h-3'/>Enter a valid email</Label>
        </div>
        <div className='flex-1 space-y-1'>
          <Label htmlFor="contact" className='text-sm font-normal pl-3'>Contact No.</Label>
          <Input id="contact" type="tel" placeholder="+91 00000 00000" />
          <Label htmlFor="contact-error" className='flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3'><AlertCircle className='w-3 h-3'/>Enter a valid Contact No.</Label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 ">
        <div className='flex-1 space-y-1'>
          <Label htmlFor="dob" className='text-sm font-normal pl-3'>Enter your Date of Birth</Label>
          <Input id="dob" type="date" placeholder="DD/MM/YYYY" />
        </div>
        <div className='flex-1 space-y-1'>
          <Label htmlFor="status" className='text-sm font-normal pl-3'>You are Currently a</Label>
          <Select>
            <SelectTrigger className="">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="CollegeGraduate">College Graduate</SelectItem>
              <SelectItem value="WorkingProfessional">Working Professional</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
              <SelectItem value="BusinessOwner">Business Owner</SelectItem>
              <SelectItem value="Consultant">Consultant</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
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
          <Select disabled={!selectedCourse}>
            <SelectTrigger className="">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apr">Apr, 2025 (Evening: 4:30 AM - 8:00 PM), Bangalore</SelectItem>
              <SelectItem value="Feb">Feb, 2025 (Morning: 10:30 AM - 1:00 PM), Bangalore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Label htmlFor="form-error" className='flex gap-1 items-center text-sm text-[#FF503D] font-normal pl-3 mt-4'>
        <AlertCircle className='w-3 h-3' />All fields are mandatory. Please fill them up to proceed.
      </Label>

      <div className="flex gap-2 justify-between items-center mt-6">
        <Button onClick={handleLoginClick} size="xl" variant="ghost">Login to Dashboard</Button>
        <Button onClick={handleVerifyClick} className='flex-1 space-y-1' size="xl">Verify Account</Button>
      </div>
    </div>
  );
};

export default SignUpForm;
