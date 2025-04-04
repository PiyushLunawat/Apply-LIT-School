import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarIcon, Mail, Phone } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useNavigate } from '@remix-run/react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from '~/api/authAPI';
import { getCentres, getCohorts, getPrograms } from '~/api/studentAPI';
import VerifyOTP from './VerifyOTP';
import { Dialog, DialogContent } from '~/components/ui/dialog';


interface Program {
  _id: string;
  name: string;
  description: string;
  duration: number;
  prefix: string;
  status: boolean;
}
interface Cohort {
  _id: string;
  cohortId: string;
  programDetail: string;
  centerDetail: string;
  startDate: string;
  endDate: string;
  schedule: string;
  totalSeats: number;
  timeSlot: string;
  filled: number;
  status: string;
  baseFee: string;
  isComplete: boolean;
}

const formSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(10, "Contact No. should be 10 digits"),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date().max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)), "You must be at least 16 years old")),
  qualification: z.string().nonempty("Qualification is required"),
  program: z.string().nonempty("Please select a program"),
  cohort: z.string().nonempty("Please select a cohort"),
});

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
}

export const SignUpForm: React.FC<SignUpFormProps> = ({}) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [programs, setPrograms] = useState<Program[]>([]);  
  const [centres, setCentres] = useState<any[]>([]);
  const [interest, setInterest] = useState<Cohort[]>([]);  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(false);

  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      dateOfBirth: undefined,
      qualification: '',
      program: '',
      cohort: '',
    },
  });
  
  const {  formState: { errors }, setError, control } = form;

  useEffect(() => {
    async function fetchData() {
      try {
        const cohortsData = await getCohorts();
        const programsData = await getPrograms();
        setPrograms(programsData.data);
        const centresData = await getCentres();
        setCentres(centresData.data);
        const openCohorts = cohortsData.data.filter((cohort:Cohort) => cohort.status === "Open");
        setInterest(openCohorts);
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Filter cohorts by selected program
    if (form.watch("program")) {
      const filteredCohorts = interest.filter(
        (cohort) => cohort.programDetail === form.watch("program")
      );
      setCohorts(filteredCohorts);
    }
  }, [form.watch("program"), interest]);

  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p._id === programId);
    return program ? program.name : "Unknown Program";
  };

  const getCenterName = (centerId: string) => {
    const center = centres.find((c) => c._id === centerId);
    return center ? center.name : "--";
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);

      const transformedData = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString().split("T")[0], // ISO format (YYYY-MM-DD)
      };

      console.log("Transformed Data:", transformedData);

      const response = await signUp(transformedData);
      console.log("Response from Sign-Up:", response);

      setEmail(data.email);
      setShowOtp(true);
    } catch (error: any) {
      setError('email', {
        type: 'manual', 
        message: error.message || 'An unexpected error occurred', // Display the error message
      });
      console.log("Sign-up failed efaefa",error)
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      form.setValue("dateOfBirth", selectedDate); // Store Date object
    }
  };
  
  function formatDateToMonthYear(dateString: string): string {
    const date = new Date(dateString);
    return format(date, "MMMM, yyyy");
  }

  return (
    <>
    <div className="gap-1 sm:gap-4 flex flex-col text-center">
        <div className="text-2xl sm:text-3xl font-semibold ">Join the Education Revolution!</div>
        <div className=" text-sm sm:text-base font-light sm:font-normal ">Register with us to begin your application process</div>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label className="text-sm font-normal pl-3">First Name</Label>
                  <Input placeholder="John" {...field} />
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label className="text-sm font-normal pl-3">Last Name</Label>
                  <Input placeholder="Doe" {...field} />
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                </FormItem>
              )}
            />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label className="text-sm font-normal pl-3">Email</Label>
                  <Input type="email" placeholder="john@gmail.com" className='pr-10' {...field} />
                  <Mail className="absolute right-3 top-[42px] w-5 h-5" />
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label className="text-sm font-normal pl-3">Contact No.</Label>
                  <div className="absolute left-3 top-[40px]">+91</div>
                  <Input  type="tel" maxLength={14} placeholder="00000 00000" className='px-10' {...field}
                  value={field.value}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }}/>
                  <Phone className="absolute right-3 top-[42px] w-5 h-5" />
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                </FormItem>
              )}
            />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-2">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => {
                const maxDate = new Date();
                maxDate.setFullYear(maxDate.getFullYear() - 16); // Subtract 16 years from today's date
                const maxDateString = maxDate.toISOString().split('T')[0];
                return (
                  <FormItem className="flex-1 flex flex-col space-y-1 relative">
                    <Label className="text-sm font-normal pl-3">Date of Birth</Label>
                    <input
                      type="date"
                      className="!h-[64px] bg-[#09090B] px-3 uppercase rounded-xl border w-full"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        field.onChange(date);
                      }}
                      max={maxDateString}
                    />
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col space-y-1 relative">
                  <Label className="text-sm font-normal pl-3">Qualification</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Highschool Graduate">Highschool Graduate</SelectItem>
                      <SelectItem value="College Graduate">College Graduate</SelectItem>
                      <SelectItem value="Working Professional">Working Professional</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                      <SelectItem value="Business Owner">Business Owner</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                </FormItem>
              )}
            />
        </div>

        <div className='space-y-2'>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-2">
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    <Label className="text-sm font-normal pl-3">Course of Interest</Label>
                    <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                      {Array.from(new Map(interest.map((int) => [int.programDetail, int])).values()).map((int) => (
                        <SelectItem key={int.programDetail} value={int.programDetail}>
                          {getProgramName(int.programDetail)}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cohort"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    <Label className="text-sm font-normal pl-3">Select Cohort</Label>
                    <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} disabled={!form.watch("program")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem key={cohort._id} value={cohort._id}>{formatDateToMonthYear(cohort.startDate)} ({cohort.timeSlot}), {getCenterName(cohort?.centerDetail)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3"/>
                  </FormItem>
                )}
              />
          </div>
          <Label htmlFor="form-alert" className='flex gap-1 items-center text-xs sm:text-sm font-normal text-[#00A3FF] font-normal mt-1 pl-3'>
            Your application form will be in line with the course of your choice.
          </Label>
        </div>

        <div className="flex gap-2 mt-6">
          <Button type="button" onClick={() => navigate('../login')} size="xl" variant="ghost" className='bg-[#27272A] hidden sm:block'>
            Login to Dashboard
          </Button>
          <Button type="submit" size="xl" className='flex-1' disabled={loading}>
            {loading ? 'Sending OTP...' : 'Verify Account'}
          </Button>
        </div>
      </form>
    </Form>

    <Dialog open={showOtp} onOpenChange={setShowOtp}>
      <DialogContent className='flex flex-col gap-6 sm:gap-8 bg-[#1C1C1C] rounded-3xl max-w-[90vw] sm:max-w-2xl lg:max-w-4xl mx-auto !p-0'>
      <VerifyOTP
          verificationType="email"
          contactInfo={email}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
        />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SignUpForm;
