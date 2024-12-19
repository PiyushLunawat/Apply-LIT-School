// Import necessary modules and components
import React, { useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { Calendar, Camera, CheckCircle, Instagram, Linkedin, Mail, Phone, SaveIcon, XIcon } from 'lucide-react';
import { UserContext } from '~/context/UserContext';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../PaymentDialog/PaymentDialog';
import { getCentres, getCohorts, getCurrentStudent, getPrograms, submitApplication } from '~/utils/studentAPI';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import VerifyOTP from '~/components/organisms/VerifyOTP/VerifyOTP';
import { verifyNumber } from '~/utils/authAPI';

type ExperienceType = 'employee' | 'business' | 'freelancer' | 'consultant';

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
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().nonempty("Address is required"),
  city: z.string().nonempty("City is required"),
  zipcode: z.string().nonempty("Postal/Zip Code is required"),
  educationLevel: z.string().nonempty("Education level is required"),
  fieldOfStudy: z.string().nonempty("Field of study is required"),
  institutionName: z.string().nonempty("Institution name is required"),
  graduationYear: z.string().nonempty("Graduation year is required"),
  hasWorkExperience: z.boolean(),
  experienceType: z.enum(['employee', 'business', 'freelancer', 'consultant']).optional(),
  jobDescription: z.string().optional(),
  companyName: z.string().optional(),
  workDuration: z.string().optional(),
  companyStartDate: z.string().optional(),
  durationOfWork: z.string().optional(),
  emergencyFirstName: z.string().nonempty("Emergency contact's first name is required"),
  emergencyLastName: z.string().nonempty("Emergency contact's last name is required"),
  emergencyContact: z.string().min(10, "Emergency contact number is required"),
  relationship: z.string().nonempty("Relationship is required"),
  fatherFirstName: z.string().nonempty("Father's first name is required"),
  fatherLastName: z.string().nonempty("Father's last name is required"),
  fatherContact: z.string().min(10, "Father's contact number is required"),
  fatherOccupation: z.string().nonempty("Father's occupation is required"),
  fatherEmail: z.string()
    .email("Email format is invalid")
    .refine((email) => email.length > 0, { message: "Father's email is required" }),
  motherFirstName: z.string().nonempty("Mother's first name is required"),
  motherLastName: z.string().nonempty("Mother's last name is required"),
  motherContact: z.string().min(10, "Mother's contact number is required"),
  motherOccupation: z.string().nonempty("Mother's occupation is required"),
  motherEmail: z.string()
    .email("Email format is invalid")
    .refine((email) => email.length > 0, { message: "Mother's email is required" }), 
  financiallyDependent: z.boolean(),
  appliedForFinancialAid: z.boolean(),
}).refine(
  (data) => data.emergencyContact !== data.contact,
  {
    message: "Emergency contact and your contact must be different.",
    path: ["emergencyContact"], // Error for emergencyContact
  }
)
.refine(
  (data) => data.fatherContact !== data.contact,
  {
    message: "Father's contact and your contact must be different.",
    path: ["fatherContact"], // Error for fatherContact
  }
)
.refine(
  (data) => data.motherContact !== data.contact,
  {
    message: "Mother's contact and your contact must be different.",
    path: ["motherContact"], // Error for motherContact
  }
)
.refine(
  (data) => data.fatherContact !== data.motherContact,
  {
    message: "Father's contact and mother's contact must be different.",
    path: ["motherContact"], // Error for motherContact
  }
)
.refine(
  (data) => data.fatherEmail !== data.email,
  {
    message: "Father's email and your email must be different.",
    path: ["fatherEmail"], // Error for Father's email
  }
)
.refine(
  (data) => data.email !== data.motherEmail,
  {
    message: "Mother's email and your email must be different.",
    path: ["motherEmail"], // Error for mother's email
  }
)
.refine(
  (data) => data.fatherEmail !== data.motherEmail,
  {
    message: "Father's email and mother's email must be different.",
    path: ["motherEmail"], // Error for mother's email
  }
);

type FormData = z.infer<typeof formSchema>;

const ApplicationDetailsForm: React.FC = () => {
  const { studentData, setStudentData } = useContext(UserContext); 
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(null);
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [ centres, setCentres] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]); 
  const [contactInfo, setContactInfo] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(studentData?.profileUrl || null);


  const [fetchedStudentData, setFetchedStudentData] = useState<any>(null);

  // Fetch current student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id); // Pass the actual student ID here
        setFetchedStudentData(student.data?.studentDetails); // Store the fetched data in state
        console.log("csc",fetchedStudentData?.currentAddress?.streetAddress);
        
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
    fetchStudentData();
  }, fetchedStudentData);

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fetchedStudentData || {
      fullName: studentData?.firstName + ' ' + studentData?.lastName || '',
      email: studentData?.email || '',
      contact: studentData?.mobileNumber || '',
      dob: studentData?.dateOfBirth?.split('T')[0] || '',
      currentStatus: studentData?.qualification || '',
      courseOfInterest: studentData?.program || '',
      cohort: studentData?.cohort || '',
      profileUrl: undefined,
      isMobileVerified: studentData?.isMobileVerified || false,
      linkedin: studentData?.linkedInUrl || "",
      instagram: studentData?.instagramUrl || "",
      gender: studentData?.gender || "Male",
      address: fetchedStudentData?.currentAddress?.streetAddress || '',
      city: fetchedStudentData?.currentAddress?.streetAddress || '',
      zipcode: fetchedStudentData?.currentAddress?.streetAddress || '',
      educationLevel: fetchedStudentData?.currentAddress?.streetAddress || '',
      fieldOfStudy: fetchedStudentData?.currentAddress?.streetAddress || '',
      institutionName: fetchedStudentData?.currentAddress?.streetAddress || '',
      graduationYear: fetchedStudentData?.currentAddress?.streetAddress || '',
      hasWorkExperience: false,
      experienceType: 'employee',
      jobDescription: fetchedStudentData?.currentAddress?.streetAddress || '',
      companyName: fetchedStudentData?.currentAddress?.streetAddress || '',
      workDuration: fetchedStudentData?.currentAddress?.streetAddress || '',
      companyStartDate: fetchedStudentData?.currentAddress?.streetAddress || '',
      durationOfWork: fetchedStudentData?.currentAddress?.streetAddress || '',
      emergencyFirstName: fetchedStudentData?.currentAddress?.streetAddress || '',
      emergencyLastName: fetchedStudentData?.currentAddress?.streetAddress || '',
      emergencyContact: fetchedStudentData?.currentAddress?.streetAddress || '',
      relationship: fetchedStudentData?.currentAddress?.streetAddress || '',
      fatherFirstName: fetchedStudentData?.currentAddress?.streetAddress || '',
      fatherLastName: fetchedStudentData?.currentAddress?.streetAddress || '',
      fatherContact: fetchedStudentData?.currentAddress?.streetAddress || '',
      fatherOccupation: fetchedStudentData?.currentAddress?.streetAddress || '',
      fatherEmail: fetchedStudentData?.currentAddress?.streetAddress || '',
      motherFirstName: fetchedStudentData?.currentAddress?.streetAddress || '',
      motherLastName: fetchedStudentData?.currentAddress?.streetAddress || '',
      motherContact: fetchedStudentData?.currentAddress?.streetAddress || '',
      motherOccupation: fetchedStudentData?.currentAddress?.streetAddress || '',
      motherEmail: fetchedStudentData?.currentAddress?.streetAddress || '',
      financiallyDependent: false,
      appliedForFinancialAid: false,
    },
  });

  const { control, handleSubmit, watch } = form;

  // Watch fields for conditional rendering
  const watchHasWorkExperience = watch('hasWorkExperience');
  const watchExperienceType = watch('experienceType');

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


  const handleContinueToDashboard = () => {
    window.location.href = '/dashboard/application-step-1';
    setSuccessDialogOpen(false);
  };

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle payment process
  const handlePayment = async () => {
    // Load the Razorpay script
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const apiPayload = {
      appFeeData:{
        "currency":"INR",
        "amount":(fetchedStudentData?.cohort?.cohortFeesDetail?.applicationFee || 500) * 100,
        "receipt":""
      }
    }

    const data = await fetch(
      "https://myfashionfind.shop/student/pay-application-fee",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appFeeData: {
            currency: "INR",
            amount: 500 * 100,
            receipt: "",
          },
        }),
      }
    )
      .then((response) => response.json())
      .catch((error) => console.error("Error:", error));

      console.log("respose data",data);
      

    // Configure Razorpay options
    const options = {
      key: 'rzp_test_1wAgBK19fS5nhr', // Replace with your Razorpay API key
      amount: data.data.amount, // Amount from server in currency subunits
      currency: data.data.currency,
      name: 'Find Corp',
      description: 'Application Fee',
      image: 'https://example.com/your_logo', // Replace with your logo URL
      order_id: data.data.id, // Use the order ID returned from the server
      handler: function (response: any) {
        console.log('Payment successful:', response);

        // Verify the payment on the server
        fetch('https://myfashionfind.shop/student/verify-application-fee-payement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appFeeData: {
                currency: "INR",
                amount: 500, 
                receipt: "", 
              },
              studentId: studentData._id,
              cohortId: studentData.cohort,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
          .then((res) => res.json())
          .then((verifyData) => {
            if (verifyData.status === 'ok') {
              setSuccessDialogOpen(true); 
            } else {
              setFailedDialogOpen(true);
            }
          })
          .catch((error) => {
            console.error('Error verifying payment:', error);
            setFailedDialogOpen(true); 
          });
      },
      prefill: {
        name: studentData?.firstName + ' ' + studentData?.lastName,
        email: studentData?.email,
        contact: studentData?.mobileNumber,
      },
      notes: {
        address: 'Corporate Office',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    
    paymentObject.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response);
      setFailedDialogOpen(true); // Open failed dialog
    });

  };

  const validateBeforeSubmit = () => {
    if (!studentData?.profileUrl) {
      return "Profile image is required.";
    }
    console.log("image",studentData?.profileUrl);
    
    // if (!studentData?.isMobileVerified) {
    //   return "Mobile number verification is required.";
    // }
    return null;
  };

  // Handle form submission
  const saveData = async (data: FormData) => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      return;
    }
    
    const formData = new FormData();
  
 
    const apiPayload = {
      studentData: {
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        mobileNumber: studentData?.mobileNumber || '',
        isMobileVerified: studentData?.isMobileVerified || false,
        email: studentData?.email || '',
        qualification: studentData?.qualification || '',
        program: studentData?.program || '',
        cohort: studentData?.cohort || '',
        gender: data.gender,
        isVerified: studentData?.isVerified || false,
        dateOfBirth: new Date(studentData?.dateOfBirth || Date.now()), 
        profile: "",
        linkedInUrl: data.linkedin || "",
        instagramUrl: data.instagram || "",
      },
      applicationData: {
        currentAddress: {
          streetAddress: data.address,
          city: data.city,
          state: "", // Optional: Add state if available
          postalCode: data.zipcode,
        },
        previousEducation: {
          highestLevelOfEducation: data.educationLevel,
          fieldOfStudy: data.fieldOfStudy,
          nameOfInstitution: data.institutionName,
          yearOfGraduation: data.graduationYear,
        },
        workExperience: data.hasWorkExperience,
        emergencyContact: {
          firstName: data.emergencyFirstName,
          lastName: data.emergencyLastName,
          contactNumber: data.emergencyContact,
          relationshipWithStudent: data.relationship,
        },
        parentInformation: {
          father: {
            firstName: data.fatherFirstName,
            lastName: data.fatherLastName,
            contactNumber: data.fatherContact,
            occupation: data.fatherOccupation,
            email: data.fatherEmail,
          },
          mother: {
            firstName: data.motherFirstName,
            lastName: data.motherLastName,
            contactNumber: data.motherContact,
            occupation: data.motherOccupation,
            email: data.motherEmail,
          },
        },
        financialInformation: {
          isFinanciallyIndependent: !data.financiallyDependent,
          hasAppliedForFinancialAid: data.appliedForFinancialAid,
        },
      },
    };
    

  // Append the image file if available
  if (studentData?.profileUrl) {
    formData.append('profileImage', studentData.profileUrl);
  }

  // Append apiPayload as a JSON string
  // formData.append('apiPayload', JSON.stringify(apiPayload));

  try {
    setLoading(true);
    
    const response = await fetch('https://myfashionfind.shop/student/submit-application', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload), 
    });

    if (response.ok) {
      // Handle success response
      console.log('Form submitted successfully', response);
      setIsSaved(true);
    } else {
      // Handle error response
      console.error('Form submission failed');
    }
  
    } catch (error) {
      console.error("Error submitting application:", error);
      setFailedDialogOpen(true); 
    } finally {
      setLoading(false);
    }
  };

  const [isSaved, setIsSaved] = useState((studentData?.applicationDetails !== undefined));
  useEffect(() => {
    if (studentData?.applicationDetails !== undefined) {
      setIsSaved(true);
    } else {
      setIsSaved(false); 
    }
  }, [studentData]);

  const onSubmit = async (data: FormData) => {
    if (isSaved) {
      console.log("pay",studentData?.applicationDetails, isSaved);
      handlePayment();
    } else {
      console.log("save",studentData?.applicationDetails, isSaved);
      await saveData(data);
    }
  };
  
  
  const handleRetry = () => {
    setFailedDialogOpen(false); // Close the dialog
    handlePayment();
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-8">
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
                  <Label className="text-base font-normal pl-3">Full Name</Label>
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
                    <Label className="text-base font-normal pl-3">Email</Label>
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
                    <Label className="text-base font-normal pl-3">Contact No.</Label>
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
                    <Label className="text-base font-normal pl-3">Date of Birth</Label>
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
                    <Label className="text-base font-normal pl-3">You are Currently a</Label>
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
                <Label className='text-base font-normal pl-3'>Course of Interest</Label>
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
                <Label className='text-base font-normal pl-3'>Select Cohort</Label>
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
        
        {/* LinkedIn and Instagram IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* LinkedIn ID */}
          <FormField
            control={control}
            name="linkedin"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-base font-normal pl-3">Your LinkedIn ID (Not Compulsory)</Label>
                <FormControl>
                  <Input id="linkedin" placeholder="linkedin.com/in" {...field} />
                </FormControl>
                <Linkedin className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Instagram ID */}
          <FormField
            control={control}
            name="instagram"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-base font-normal pl-3">Your Instagram ID (Not Compulsory)</Label>
                <FormControl>
                  <Input id="instagram" placeholder="@JohnDoe" {...field} />
                </FormControl>
                <Instagram className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Gender Selection */}
        <FormField
          control={control}
          name="gender"
          render={({ field }) => (
            <FormItem className='flex-1 space-y-1 pl-3'>
              <Label className="text-base font-normal">Select Your Gender</Label>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male" className="text-base font-normal">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female" className="text-base font-normal">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="other" />
                    <Label htmlFor="other" className="text-base font-normal">Other</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Current Address */}
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem className='flex-1 space-y-1'>
              <Label htmlFor="address" className="text-base font-normal pl-3">Your Current Address</Label>
              <FormControl>
                <Input id="address" placeholder="Street Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City and Zip Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* City */}
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="city" className="text-base font-normal pl-3">City, State</Label>
                <FormControl>
                  <Input id="city" placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Zip Code */}
          <FormField
            control={control}
            name="zipcode"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="zipcode" className="text-base font-normal pl-3">Postal/Zip Code</Label>
                <FormControl>
                  <Input maxLength={6} id="zipcode" placeholder="Postal/Zip Code" {...field} 
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Previous Education */}
        <div className='flex-1 bg-[#FF791F]/[0.2] text-[#FF791F] text-center py-4 mt-10 text-2xl rounded-full'>
          Previous Education
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Education Level */}
          <FormField
            control={control}
            name="educationLevel"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="educationLevel" className="text-base font-normal pl-3">Highest Level of Education Attained</Label>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">High School</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Field of Study */}
          <FormField
            control={control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fieldOfStudy" className="text-base font-normal pl-3">Field of Study (Your Major)</Label>
                <FormControl>
                  <Input id="fieldOfStudy" placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Institution Name and Graduation Year */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Institution Name */}
          <FormField
            control={control}
            name="institutionName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="institutionName" className="text-base font-normal pl-3">Name of Institution</Label>
                <FormControl>
                  <Input id="institutionName" placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Graduation Year */}
          <FormField
            control={control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col space-y-1">
                <Label htmlFor="graduationYear" className="text-base font-normal pl-3">Year of Graduation</Label>
                <FormControl>
                  <input 
                    placeholder="MM YYYY"
                    type="month"
                    className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                    id="graduationYear" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Experience */}
        <FormField
          control={control}
          name="hasWorkExperience"
          render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1 pl-3">
                <Label className="text-base font-normal">Do you have any work experience?</Label>
                <FormControl>
                  <RadioGroup
                    className="flex space-x-6 mt-2"
                    onValueChange={(value) => {
                      const booleanValue = value === 'yes';
                      field.onChange(booleanValue);
                      setHasWorkExperience(booleanValue);
                    }}
                    value={field.value ? 'yes' : 'no'}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yesWorkExperience" />
                      <Label htmlFor="yesWorkExperience" className="text-base font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="noWorkExperience" />
                      <Label htmlFor="noWorkExperience" className="text-base font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Conditional Work Experience Section */}
        {watchHasWorkExperience && (
          <>
            {/* Experience Type and Job Description */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Experience Type */}
              <FormField
                control={control}
                name="experienceType"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label htmlFor="experienceType" className="text-base font-normal pl-3">Select Your Latest Work Experience Type</Label>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setExperienceType(value as ExperienceType);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="business">Business Owner</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Job Description */}
              <FormField
                control={control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label htmlFor="jobDescription" className="text-base font-normal pl-3">Latest Job/Service Description</Label>
                    <FormControl>
                      <Input id="jobDescription" placeholder="Type here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Fields Based on Experience Type */}
            {watchExperienceType === 'employee' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Company Name */}
                <FormField
                  control={control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company (Latest or Current)</Label>
                      <FormControl>
                        <Input id="companyName" placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Work Duration */}
                <FormField
                  control={control}
                  name="workDuration"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="workDuration" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <input 
                          placeholder="MM/YYYY - MM/YYYY" 
                          type="month"
                          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                          id="workDuration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchExperienceType === 'business' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Company Name */}
                <FormField
                  control={control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company</Label>
                      <FormControl>
                        <Input id="companyName" placeholder="Type here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Company Start Date */}
                <FormField
                  control={control}
                  name="companyStartDate"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="companyStartDate" className="text-base font-normal pl-3">When Did You Start Your Company?</Label>
                      <FormControl>
                        <input 
                          placeholder="MM/YYYY" 
                          type="month"
                          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                          id="companyStartDate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchExperienceType === 'freelancer' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Duration of Work */}
                <FormField
                  control={control}
                  name="durationOfWork"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="durationOfWork" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <input 
                          placeholder="MM/YYYY - MM/YYYY" 
                          type="month"
                          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                          id="durationOfWork" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchExperienceType === 'consultant' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Duration of Work */}
                <FormField
                  control={control}
                  name="durationOfWork"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="durationOfWork" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <input 
                          placeholder="MM/YYYY - MM/YYYY" 
                          type="month"
                          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                          id="durationOfWork" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}

        {/* Emergency Contact Details */}
        <div className='flex-1 bg-[#00AB7B]/[0.2] text-[#00AB7B] text-center py-4 mt-10 text-2xl rounded-full'>
          Emergency Contact Details
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Emergency Contact First Name */}
          <FormField
            control={control}
            name="emergencyFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="emergencyFirstName" className="text-base font-normal pl-3">First Name</Label>
                <FormControl>
                  <Input id="emergencyFirstName" placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Emergency Contact Last Name */}
          <FormField
            control={control}
            name="emergencyLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="emergencyLastName" className="text-base font-normal pl-3">Last Name</Label>
                <FormControl>
                  <Input id="emergencyLastName" placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Emergency Contact Number */}
          <FormField
            control={control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="emergencyContact" className="text-base font-normal pl-3">Contact No.</Label>
                <FormControl>
                  <Input id="emergencyContact" type='tel' placeholder="+91 00000 00000" {...field} maxLength={14}
                  value={field.value || "+91 "}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Relationship */}
          <FormField
            control={control}
            name="relationship"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="relationship" className="text-base font-normal pl-3">Relationship with Contact</Label>
                <FormControl>
                  <Input id="relationship" placeholder="Father/Mother/Sibling" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parental Information */}
        <div className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 mt-10 text-2xl rounded-full'>
          Parental Information
        </div>
        {/* Father's Information */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Father's First Name */}
          <FormField
            control={control}
            name="fatherFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherFirstName" className="text-base font-normal pl-3">Father's First Name</Label>
                <FormControl>
                  <Input id="fatherFirstName" placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Last Name */}
          <FormField
            control={control}
            name="fatherLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherLastName" className="text-base font-normal pl-3">Father's Last Name</Label>
                <FormControl>
                  <Input id="fatherLastName" placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Father's Contact Number */}
          <FormField
            control={control}
            name="fatherContact"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherContact" className="text-base font-normal pl-3">Father's Contact No.</Label>
                <FormControl>
                  <Input id="fatherContact" type='tel' placeholder="+91 00000 00000" {...field} maxLength={14}
                  value={field.value || "+91 "}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Occupation */}
          <FormField
            control={control}
            name="fatherOccupation"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherOccupation" className="text-base font-normal pl-3">Father's Occupation</Label>
                <FormControl>
                  <Input id="fatherOccupation" placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Mother's Last Name */}
          <FormField
            control={control}
            name="fatherEmail"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherEmail" className="text-base font-normal pl-3">Father's Email</Label>
                <FormControl>
                  <Input id="fatherEmail" placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="motherFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherFirstName" className="text-base font-normal pl-3">Mother's First Name</Label>
                <FormControl>
                  <Input id="motherFirstName" placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Mother's Last Name */}
          <FormField
            control={control}
            name="motherLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherLastName" className="text-base font-normal pl-3">Mother's Last Name</Label>
                <FormControl>
                  <Input id="motherLastName" placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mother's Contact Number */}
          <FormField
            control={control}
            name="motherContact"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherContact" className="text-base font-normal pl-3">Mother's Contact No.</Label>
                <FormControl>
                  <Input id="motherContact" type='tel' placeholder="+91 00000 00000" {...field} maxLength={14}
                  value={field.value || "+91 "}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Mother's Occupation */}
          <FormField
            control={control}
            name="motherOccupation"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherOccupation" className="text-base font-normal pl-3">Mother's Occupation</Label>
                <FormControl>
                  <Input id="motherOccupation" placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mother's First Name */}
          <FormField
            control={control}
            name="motherEmail"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherEmail" className="text-base font-normal pl-3">Mother's Email</Label>
                <FormControl>
                  <Input id="motherEmail" placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Financial Dependency and Aid */}
        <div className='space-y-2'>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Financially Dependent */}
          <FormField
            control={control}
            name="financiallyDependent"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-base font-normal">Are you financially dependent on your Parents?</Label>
                <FormControl>
                  <RadioGroup
                    className="flex space-x-6 mt-2"
                    onValueChange={(value) => field.onChange(value === 'yes')}
                    value={field.value ? 'yes' : 'no'}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yesFinanciallyDependent" />
                      <Label htmlFor="yesFinanciallyDependent" className="text-base font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="noFinanciallyDependent" />
                      <Label htmlFor="noFinanciallyDependent" className="text-base font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Applied for Financial Aid */}
          <FormField
            control={control}
            name="appliedForFinancialAid"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-base font-normal">Have you tried applying for financial aid earlier?</Label>
                <FormControl>
                  <RadioGroup
                    className="flex space-x-6 mt-2"
                    onValueChange={(value) => field.onChange(value === 'yes')}
                    value={field.value ? 'yes' : 'no'}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yesFinancialAid" />
                      <Label htmlFor="yesFinancialAid" className="text-base font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="noFinancialAid" />
                      <Label htmlFor="noFinancialAid" className="text-base font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          {(!studentData?.profileUrl || !studentData?.isMobileVerified) && (
            <div className="text-red-500 text-sm font-medium pl-3">
              {studentData?.profileUrl
                ? null
                : "Please upload your profile image before submitting."}<br></br>
              {!studentData?.isMobileVerified &&
                " Please verify your mobile number before submitting."}
            </div>
          )}

        </div>
 
        <div className="flex justify-between items-center mt-10">
          <Button variant="link" type='button' onClick={() => form.reset() }>Clear Form</Button>
          <Button size="xl" className='px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="submit" disabled={loading}>
            <div className='flex items-center gap-2'>
              {isSaved ? (
                <>{loading ? 'Initializing Payment...' : 'Pay INR 500.00'}</> 
              ) : (
                 <> <SaveIcon className='w-5 h-5' />{loading ? 'Submitting...' : 'Submit'}</>
              ) }
            </div>
          </Button>
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
    <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleContinueToDashboard}/>
    <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleRetry}/>
    </>
  );
};

export default ApplicationDetailsForm;
