// Import necessary modules and components
import React, { useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Badge } from '~/components/ui/badge';
import { Mail, Phone, Linkedin, Instagram, Calendar, Camera, CheckCircle, XIcon, Pencil } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { useNavigate } from '@remix-run/react';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import VerifyOTP from '~/components/organisms/VerifyOTP/VerifyOTP';
import { getCentres, getCohorts, getPrograms, verifyNumber } from '~/utils/api';
import { UserContext } from '~/context/UserContext';

// Define the form schema using Zod
const formSchema = z.object({
  fullName: z.string().nonempty("Full Name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().nonempty("Contact number is required"),
  dob: z.string().nonempty("Date of Birth is required"),
  currentStatus: z.string().nonempty("Current status is required"),
  courseOfInterest: z.string().nonempty("Course of Interest is required"),
  cohort: z.string().nonempty("Cohort selection is required"),
  profileUrl: z.any().optional(),
  isMobileVerified: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AccountDetailsForm: React.FC = () => {
  const { studentData, setStudentData } = useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [ centres, setCentres] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]); 
  const [contactInfo, setContactInfo] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(studentData?.profileUrl || null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: studentData?.firstName + ' ' + studentData?.lastName || '',
      email: studentData?.email || '',
      contact: studentData?.mobileNumber || '',
      dob: studentData?.dateOfBirth?.split('T')[0] || '',
      currentStatus: studentData?.qualification || '',
      courseOfInterest: studentData?.program || '',
      cohort: studentData?.cohort || '',
      profileUrl: undefined,
      isMobileVerified: studentData?.isMobileVerified || false,
    },
  });

  const { control, handleSubmit, setValue } = form;

  useEffect(() => {
    async function fetchCohorts() {
      try {
        const programsData = await getPrograms();
        setPrograms(programsData.data);
        const centresData = await getCentres();
        setCentres(centresData.data);
        const cohortsData = await getCohorts();
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    }
    fetchCohorts();
  }, []);

  const handleVerifyClick = async (contact: string) => {
    const formattedContact = studentData?.mobileNumber.replace('+91 ', '') || '';
    console.log("xxdv",formattedContact)
    try {
      const response = await verifyNumber({ phone: formattedContact });
      console.log('Verification initiated:', response);
    } catch (error) {
      console.error('Error verifying number:', error);
    }
    setContactInfo(formattedContact);
    setIsDialogOpen(true);
  };

  const formatDate = (isoDate: string | number | Date) => {
    if (!isoDate) return ''; // Handle cases where date is undefined
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p._id === programId);
    return program ? program.name : "--";
  };

  const getCenterName = (centerId: string) => {
    const center = centres.find((c) => c._id === centerId);
    return center ? center.name : "--";
  };


  const getCohortName = (cohortId: string) => {
    const cohort = cohorts.find((c) => c._id === cohortId);
    return cohort ? `${formatDateToMonthYear(cohort?.startDate)} (${cohort?.timeSlot}), ${getCenterName(cohort?.centerDetail)}` : "--";
  };

  const formatDateToMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <>
    <Form {...form}>
      <form className="flex flex-col gap-6 mt-8">
        <Badge size="xl" className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center '>Personal Details</Badge>
        <div className="grid sm:flex gap-6">
          {/* Image Upload */}
          <div className="w-full sm:w-[232px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
      {imagePreview ? (
        <div className="w-full h-full relative">
          <img
            src={imagePreview}
            alt="Passport Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              className="p-2 bg-white/10 border border-white rounded-full hover:bg-white/20"
              onClick={() => {
                setImagePreview(null);
                setStudentData({ ...studentData, profileUrl: null });
              }}
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <>
        <label
          htmlFor="passport-input"
          className="cursor-pointer flex flex-col items-center justify-center items-center bg-[#1F1F1F] px-6 rounded-xl border-[#2C2C2C] w-full h-[220px]"
        >
          <div className="text-center my-auto text-muted-foreground">
            <Camera className="mx-auto mb-2 w-8 h-8" />
            <div className="text-wrap">
              Upload a Passport size Image of Yourself. Ensure that your face covers
              60% of this picture.
            </div>
          </div>
          <input
            id="passport-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
                setStudentData({ ...studentData, profileUrl: file });
              }
            }}
          />
        </label>


          {/* <div className="text-center p-6 text-muted-foreground">
            <Camera className="mx-auto mb-2 w-8 h-8" />
            <div className="text-wrap">
              Upload a Passport size Image of Yourself. Ensure that your face covers
              60% of this picture.
            </div>
          </div>
          <Input
            id="passport-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
                setStudentData({ ...studentData, profileUrl: file });
              }
            }}
          /> */}
        </>
      )}
    </div>


          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Full Name */}
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem className='flex-1 space-y-1'>
                  <FormLabel className="text-base font-normal pl-3">Full Name</FormLabel>
                  <FormControl>
                    <Input id="fullName" defaultValue={((studentData?.firstName || "-")+' '+(studentData?.lastName || "-"))} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email and Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Email */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className='flex-1 space-y-1 relative'>
                    <CheckCircle className="text-[#00CC92] absolute left-3 top-[52px] w-5 h-5 " />
                    <FormLabel className="text-base font-normal pl-3">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="johndoe@gmail.com"
                        className='pl-10'
                        defaultValue={studentData?.email || "--"}
                      />
                    </FormControl>
                    <Mail className="absolute right-3 top-[46px] w-5 h-5 " />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Contact */}
              <FormField
                control={control}
                name="contact"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    {studentData?.isMobileVerified ? 
                      <CheckCircle className="text-[#00CC92] absolute left-3 top-[52px] w-5 h-5 " /> : 
                      <Phone className="absolute left-3 top-[52px] w-5 h-5 " />
                    }
                    <FormLabel className="text-base font-normal pl-3">Contact No.</FormLabel>
                    <FormControl>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="+91 95568 97688"
                        className='pl-10'
                        defaultValue={studentData?.mobileNumber || "--"}
                      />
                    </FormControl>
                    {studentData?.isMobileVerified ?
                      <Phone className="absolute right-3 top-[46px] w-5 h-5" /> : 
                      <Button size='sm' className='absolute right-3 top-10 rounded-full px-4 bg-[#00CC92]' onClick={() => handleVerifyClick(field.value)} type="button">
                        Verify
                      </Button>
                    }
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth and Current Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Date of Birth */}
              <FormField
                control={control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    <FormLabel className="text-base font-normal pl-3">Date of Birth</FormLabel>
                    <FormControl>
                      <Input id="dob" type="text" placeholder="08 March, 2000" defaultValue={formatDate(studentData?.dateOfBirth)}/>
                    </FormControl>
                    <Calendar className="absolute right-3 top-[46px] w-5 h-5" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Currently a */}
              <FormField
                control={control}
                name="currentStatus"
                render={({ field }) => (
                  <FormItem className='flex-1 space-y-1'>
                    <FormLabel className="text-base font-normal pl-3">You are Currently a</FormLabel>
                    <FormControl>
                      <Input id="currentStatus" type="text" placeholder="College Student" defaultValue={studentData?.qualification} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Course of Interest and Select Cohort */}
        <div className="flex flex-col sm:flex-row gap-2 ">
          {/* Course of Interest */}
          <FormField
            control={control}
            name="courseOfInterest"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <FormLabel className='text-base font-normal pl-3'>Course of Interest</FormLabel>
                <FormControl>
                  <Select
                    value={studentData?.program}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={studentData?.program}>{getProgramName(studentData?.program)}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <Label htmlFor="form-alert" className='flex gap-1 items-center text-sm text-[#00A3FF] font-normal pl-3 mt-1'>
                  Your application form will be in line with the course of your choice.
                </Label>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Select Cohort */}
          <FormField
            control={control}
            name="cohort"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <FormLabel className='text-base font-normal pl-3'>Select Cohort</FormLabel>
                <FormControl>
                  <Select
                    value={studentData?.cohort}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key={studentData?.cohort} value={studentData?.cohort}>{getCohortName(studentData?.cohort)}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-4xl !p-0'>
            <VerifyOTP
              verificationType="contact" 
              contactInfo={contactInfo}
              errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
              setIsDialogOpen={setIsDialogOpen}
            />
          </DialogContent>
        </Dialog>
    </>
  );
};

export default AccountDetailsForm;
