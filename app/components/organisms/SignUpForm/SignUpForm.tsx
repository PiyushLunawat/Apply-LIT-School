import React, { useEffect, useState } from 'react';
import { getCohorts, getPrograms, signUp } from '~/utils/api';
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
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
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
  const [interest, setInterest] = useState<Cohort[]>([]);  
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
      dateOfBirth: undefined,
      qualification: '',
      program: '',
      cohort: '',
      password: 'hi',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const cohortsData = await getCohorts();
        const programsData = await getPrograms();
        setPrograms(programsData.data);
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Convert `dateOfBirth` to ISO format
      const transformedData = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString().split("T")[0], // ISO format (YYYY-MM-DD)
      };

      console.log("Transformed Data:", transformedData);

      const response = await signUp(transformedData);
      console.log("Response from Sign-Up:", response);

      setEmail(data.email);
      setShowOtp(true);
    } catch (error) {
      setError("Sign-up failed. Please try again.");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 px-4">
        <div className="grid sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
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
              <FormItem className="flex-1 space-y-1 relative">
                <Label>Last Name</Label>
                <Input placeholder="Doe" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label>Email</Label>
                <Input type="email" placeholder="johndoe@gmail.com" {...field} />
                <Mail className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label>Contact No.</Label>
                <Input  type="tel" maxLength={14}
        placeholder="+91 00000 00000"
        {...field}
        onFocus={(e) => {
          if (!field.value) {
            field.onChange('+91 ');
          }
        }}
        onChange={(e) => {
          let value = e.target.value;
          // Remove all non-numeric characters, but allow "+91" at the beginning
          if (value.startsWith('+91 ')) {
            value = '+91 ' + value.slice(4).replace(/\D/g, ''); // Retain only digits after +91
          } else {
            value = value.replace(/[^0-9+\s]/g, ''); // For any other input, retain only digits
          }
          field.onChange(value);
        }}/>
                <Phone className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
        <FormField
  control={form.control}
  name="dateOfBirth"
  render={({ field }) => (
    <FormItem className="flex-1 space-y-1 relative">
      <Label>Date of Birth</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="xl"
            className="w-full text-left !h-[64px] items-center justify-start h-12"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value
              ? format(new Date(field.value), 'dd/MM/yyyy') // Format only for display
              : <span className="text-muted-foreground">DD/MM/YYYY</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                field.onChange(selectedDate); // Store as Date object
                setDate(selectedDate); // Update local state
              }
            }}
          />
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
              <FormItem className="flex-1 space-y-1 relative">
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
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1 relative">
              <Label>Course of Interest</Label>
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
            <FormItem className="flex-1 space-y-1 relative">
              <Label>Select Cohort</Label>
              <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} disabled={!form.watch("program")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort._id} value={cohort._id}>{formatDateToMonthYear(cohort.startDate)} ({cohort.timeSlot})</SelectItem>
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
