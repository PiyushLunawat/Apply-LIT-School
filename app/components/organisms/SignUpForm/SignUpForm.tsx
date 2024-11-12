import React, { useEffect, useState } from 'react';
import { getCohorts, getPrograms, signUp } from '~/utils/api';
import { AlertCircle, CalendarIcon } from 'lucide-react';
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
  dateOfBirth: z.string().nonempty("Date of birth is required"),
  qualification: z.string().nonempty("Qualification is required"),
  program: z.string().nonempty("Please select a program"),
  cohort: z.string().nonempty("Please select a cohort"),
  password: z.string().nonempty("Please select a cohort"),
});

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ setShowOtp, setEmail }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [programs, setPrograms] = useState<Program[]>([]);  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      dateOfBirth: '',
      qualification: '',
      program: '',
      cohort: '',
      password: 'hi',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const programsData = await getPrograms();
        setPrograms(programsData.data);
        const cohortsData = await getCohorts();
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    }
    fetchData();
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      console.log("dataa", data)
      await signUp(data);
      setEmail(data.email);
      setShowOtp(true);
    } catch (error) {
      setError('Sign-up failed. Please try again.');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      form.setValue("dateOfBirth", format(date, 'dd/MM/yyyy'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <Label>First Name</Label>
                <Input placeholder="John" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <Label>Last Name</Label>
                <Input placeholder="Doe" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>Email</Label>
                <Input type="email" placeholder="johndoe@gmail.com" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <Label>Contact No.</Label>
                <Input type="tel" placeholder="+91 00000 00000" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="xl" className="w-full text-left !h-[64px] items-center justify-start h-12">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : <span className='text-muted-foreground'>DD/MM/YYYY</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qualification"
            render={({ field }) => (
              <FormItem>
                <Label>Qualification</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="CollegeGraduate">College Graduate</SelectItem>
                    <SelectItem value="WorkingProfessional">Working Professional</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="BusinessOwner">Business Owner</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <Label>Course of Interest</Label>
              <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program._id} value={program._id}>{program.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label htmlFor="form-alert" className='flex gap-1 items-center text-sm text-[#00A3FF] font-normal mt-1'>
                Your application form will be in line with the course of your choice.
              </Label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cohort"
          render={({ field }) => (
            <FormItem>
              <Label>Select Cohort</Label>
              <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} disabled={!form.watch("program")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort._id} value={cohort._id}>{cohort.cohortId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        </div>

        <div className="flex gap-2 mt-6">
          <Button type="button" onClick={() => navigate('../login')} size="xl" variant="ghost">
            Login to Dashboard
          </Button>
          <Button type="submit" size="xl" className='flex-1'>
            Verify Account
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
