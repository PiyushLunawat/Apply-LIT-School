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
import { Calendar, Camera, CheckCircle, Instagram, Linkedin, Mail, Minus, Phone, SaveIcon, XIcon } from 'lucide-react';
import { UserContext } from '~/context/UserContext';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../PaymentDialog/PaymentDialog';
import { getCentres, getCohorts, getCurrentStudent, getPrograms, payApplicationFee, submitApplication, verifyApplicationFeePayment } from '~/utils/studentAPI';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import VerifyOTP from '~/components/organisms/VerifyOTP/VerifyOTP';
import { verifyNumber } from '~/utils/authAPI';
import { format } from 'date-fns';

type ExperienceType = 'Working Professional' | 'Business Owner' | 'Freelancer' | 'Consultant';

const formSchema = z.object({
  studentData: z.object({   
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    contact: z.string().optional(),
    dob: z.string().optional(),
    currentStatus: z.string().optional(),
    courseOfInterest: z.string().optional(),
    cohort: z.string().optional(),
    isMobileVerified: z.boolean().optional(),
    linkedInUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]),
  }),
  profileUrl: z.any().optional(),
  applicationData: z.object({  
    address: z.string().nonempty("Address is required"),
    city: z.string().nonempty("City is required"),
    zipcode: z.string().nonempty("Postal/Zip Code is required"),
    educationLevel: z.string().nonempty("Education level is required"),
    fieldOfStudy: z.string().nonempty("Field of study is required"),
    institutionName: z.string().nonempty("Institution name is required"),
    graduationYear: z.string().nonempty("Graduation year is required"),
    isExperienced: z.boolean(),
    experienceType: z.enum(['', 'Working Professional', 'Business Owner', 'Freelancer', 'Consultant']).optional(),
    nameOfCompany: z.string().optional(),
    duration: z.string().optional(),
    durationFrom: z.string().optional(),
    durationTo: z.string().optional(),
    jobDescription: z.string().optional(),
    emergencyFirstName: z.string().nonempty("Emergency contact's first name is required"),
    emergencyLastName: z.string().nonempty("Emergency contact's last name is required"),
    emergencyContact: z.string().min(10, "Emergency contact number is required"),
    relationship: z.string().nonempty("Relationship is required"),
    fatherFirstName: z.string().optional(),
    fatherLastName: z.string().optional(),
    fatherContact: z.string().optional(),
    fatherOccupation: z.string().optional(),
    fatherEmail: z
      .string()
      .optional(),
    motherFirstName: z.string().optional(),
    motherLastName: z.string().optional(),
    motherContact: z.string().optional(),
    motherOccupation: z.string().optional(),
    motherEmail: z
    .string()
    .optional(),
    financiallyDependent: z.boolean(),
    appliedForFinancialAid: z.boolean(),
  }),
})
.refine(
  (data) =>
    // Ensure at least one parent's details are filled
    (data.applicationData.fatherFirstName &&
      data.applicationData.fatherLastName &&
      data.applicationData.fatherContact &&
      data.applicationData.fatherOccupation &&
      data.applicationData.fatherEmail) ||
    (data.applicationData.motherFirstName &&
      data.applicationData.motherLastName &&
      data.applicationData.motherContact &&
      data.applicationData.motherOccupation &&
      data.applicationData.motherEmail),
  {
    message: "Either mother's or father's details must be provided.",
    path: ["applicationData.motherOccupation"], 
  }
).refine(
  (data) => data.applicationData.emergencyContact !== data.studentData.contact,
  {
    message: "Emergency contact and your contact must be different.",
    path: ["applicationData.emergencyContact"], // Error for emergencyContact
  }
)
.refine(
  (data) => data.applicationData.fatherContact !== data.studentData.contact,
  {
    message: "Father's contact and your contact must be different.",
    path: ["applicationData.fatherContact"], // Error for fatherContact
  }
)
.refine(
  (data) => data.applicationData.motherContact !== data.studentData.contact,
  {
    message: "Mother's contact and your contact must be different.",
    path: ["applicationData.motherContact"], // Error for motherContact
  }
)
.refine(
  (data) => (data.applicationData.fatherContact !== data.applicationData.motherContact &&
    data.applicationData.fatherContact !== ''),
  {
    message: "Father's contact and mother's contact must be different.",
    path: ["applicationData.motherContact"], // Error for motherContact
  }
)
.refine(
  (data) => data.applicationData.fatherEmail !== data.studentData.email,
  {
    message: "Father's email and your email must be different.",
    path: ["applicationData.fatherEmail"], // Error for Father's email
  }
)
.refine(
  (data) => data.studentData.email !== data.applicationData.motherEmail,
  {
    message: "Mother's email and your email must be different.",
    path: ["applicationData.motherEmail"], // Error for mother's email
  }
)
.refine(
  (data) => (data.applicationData.fatherEmail !== data.applicationData.motherEmail &&
    data.applicationData.fatherEmail !== ''
  ),
  {
    message: "Father's email and mother's email must be different.",
    path: ["applicationData.motherEmail"], // Error for mother's email
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [ centres, setCentres] = useState<any[]>([]);
  const [interest, setInterest] = useState<any[]>([]); 
  const [cohorts, setCohorts] = useState<any[]>([]); 
  const [contactInfo, setContactInfo] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState((studentData?.applicationDetails !== undefined));
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(studentData?.profileUrl || '');

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
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentData: {
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        email: studentData?.email || '',
        contact: studentData?.mobileNumber || '',
        dob: studentData?.dateOfBirth || '',
        currentStatus: studentData?.qualification || '',
        courseOfInterest: studentData?.program || '',
        cohort: studentData?.cohort || '',
        linkedInUrl: studentData?.linkedInUrl || '',
        instagramUrl: studentData?.instagramUrl || '',
        gender: "Male",
      },
      profileUrl: studentData?.profileUrl || null,
      applicationData: {
        address: '',
        city: '',
        zipcode: '',
        educationLevel: '',
        fieldOfStudy: '',
        institutionName: '',
        graduationYear: '',
        isExperienced: false,
        durationFrom: '',
        durationTo: '',
        duration: '',
        emergencyFirstName: '',
        emergencyLastName: '',
        emergencyContact: '',
        relationship: '',
        fatherFirstName: '',
        fatherLastName: '',
        fatherContact: '',
        fatherOccupation: '',
        fatherEmail: '',
        motherFirstName: '',
        motherLastName: '',
        motherContact: '',
        motherOccupation: '',
        motherEmail: '',
        financiallyDependent: false,
        appliedForFinancialAid: false,
      },
    },
  });

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = form;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const student = await getCurrentStudent(studentData._id);
        const sData = student.data?.studentDetails;
          if (student.data?.applicationDetails !== undefined) {
            setIsSaved(true);
          } else {
            setIsSaved(false); 
          }
          if(student.data?.applicationDetails?.applicationFeeDetail?.status === 'paid')
            setIsPaymentDone(true);

        // Once fetched, reset the form with the fetched data
        reset({
          studentData: {
            firstName: studentData?.firstName || '',
            lastName: studentData?.lastName || '',
            email: studentData?.email || '',
            contact: studentData?.mobileNumber || '',
            dob: studentData?.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
            currentStatus: studentData?.qualification || '',
            courseOfInterest: studentData?.program || '',
            cohort: studentData?.cohort || '',
            linkedInUrl: student.data?.linkedInUrl || '',
            instagramUrl: student.data?.instagramUrl || '',
            gender: studentData?.gender || "Male",
          },
          applicationData: {
            address: sData?.currentAddress?.streetAddress || '',
          city: sData?.currentAddress?.city || '',
          zipcode: sData?.currentAddress?.postalCode || '',
          educationLevel: sData?.previousEducation?.highestLevelOfEducation || '',
          fieldOfStudy: sData?.previousEducation?.fieldOfStudy || '',
          institutionName: sData?.previousEducation?.nameOfInstitution || '',
          graduationYear: sData?.previousEducation?.yearOfGraduation || '',
          isExperienced: sData?.workExperience || 
            ["Working Professional", "Freelancer", "Business Owner", "Consultant",].includes(studentData?.qualification) 
            || false,
          experienceType: sData?.experienceType || studentData?.qualification || '',
          nameOfCompany: sData?.nameOfCompany || '',
          durationFrom: '',
          durationTo: '',
          duration: sData?.duration || '',
          jobDescription: sData?.jobDescription || '',
          emergencyFirstName: sData?.emergencyContact?.firstName || '',
          emergencyLastName: sData?.emergencyContact?.lastName || '',
          emergencyContact: sData?.emergencyContact?.contactNumber || '',
          relationship: sData?.emergencyContact?.relationshipWithStudent || '',
          fatherFirstName: sData?.parentInformation?.father?.firstName || '',
          fatherLastName: sData?.parentInformation?.father?.lastName || '',
          fatherContact: sData?.parentInformation?.father?.contactNumber || '',
          fatherOccupation: sData?.parentInformation?.father?.occupation || '',
          fatherEmail: sData?.parentInformation?.father?.email || '',
          motherFirstName: sData?.parentInformation?.mother?.firstName || '',
          motherLastName: sData?.parentInformation?.mother?.lastName || '',
          motherContact: sData?.parentInformation?.mother?.contactNumber || '',
          motherOccupation: sData?.parentInformation?.mother?.occupation || '',
          motherEmail: sData?.parentInformation?.mother?.email || '',
          financiallyDependent: !sData?.financialInformation?.isFinanciallyIndependent || false,
          appliedForFinancialAid: sData?.financialInformation?.hasAppliedForFinancialAid || false,
        }
        });

        setFetchedStudentData(sData);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };

    fetchStudentData();
  }, [studentData, reset]);
  

  // Watch fields for conditional rendering
  const watchHasWorkExperience = watch('applicationData.isExperienced');
  const watchExperienceType = watch('applicationData.experienceType');

  const formatMonthYear = (dateStr: any) => {
    const [year, month] = dateStr.split('-');
    return `${month}/${year}`;
  };

  useEffect(() => {
    const durationFrom = watch('applicationData.durationFrom');
    const durationTo = watch('applicationData.durationTo');

    if (durationFrom && durationTo) {
      const formattedFrom = formatMonthYear(durationFrom);
      const formattedTo = formatMonthYear(durationTo);
      setValue('applicationData.duration', `${formattedFrom} - ${formattedTo}`);
    } else {
      setValue('applicationData.duration', '');
    }
  }, [watch('applicationData.durationFrom'), watch('applicationData.durationTo'), setValue]);


  useEffect(() => {
    async function fetchCohorts() {
      try {
        const programsData = await getPrograms();
        setPrograms(programsData.data);
        const centresData = await getCentres();
        setCentres(centresData.data);
        const cohortsData = await getCohorts();
        const openCohorts = cohortsData.data.filter((cohort: any) => cohort.status === "Open");
        setInterest(openCohorts);
        console.log("vss");
        
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

   useEffect(() => {
      // Filter cohorts by selected program
      if (form.watch("studentData.courseOfInterest")) {
        const filteredCohorts = interest.filter(
          (interest) => interest?.programDetail === form.watch("studentData.courseOfInterest")
        );
        setCohorts(filteredCohorts);
      }
    }, [form.watch("studentData.courseOfInterest"), interest]);
  
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
    try {
      // Show loading
      setLoading(true);
  
      // Load the Razorpay script
      const razorpayLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!razorpayLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }
  
      // Fetch application fee amount
      const applicationFee = fetchedStudentData?.cohort?.cohortFeesDetail?.applicationFee || 500;
  
      // Call the API to create an order
      const feeResponse = await payApplicationFee(applicationFee, "INR");
      console.log("Fee payment response:", feeResponse);
  
      // Configure Razorpay options
      const options = {
        key: 'rzp_test_1wAgBK19fS5nhr', // Replace with your Razorpay API key
        amount: feeResponse.data.amount, // Amount in currency subunits
        currency: feeResponse.data.currency,
        name: 'The LIT School',
        description: 'Application Fee',
        image: 'https://example.com/your_logo', // Replace with your logo URL
        order_id: feeResponse.data.id, // Use the order ID returned from the server
        handler: async function (response: any) {
          console.log('Payment successful:', response);
  
          // Prepare payload for payment verification
          const verifyPayload = {
            appFeeData: {
              currency: "INR",
              amount: applicationFee,
              receipt: "",
            },
            studentId: studentData._id,
            cohortId: studentData.cohort,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
  
          // Verify the payment on the server
          try {
            const verifyResponse = await verifyApplicationFeePayment(verifyPayload);
            console.log("Payment verification response:", verifyResponse);
  
            if (verifyResponse.status === 'ok') {
              setIsPaymentDone(true);
              setSuccessDialogOpen(true);
            } else {
              setFailedDialogOpen(true);
            }
          } catch (verificationError) {
            console.error('Error verifying payment:', verificationError);
            setFailedDialogOpen(true);
          }
        },
        prefill: {
          name: `${studentData?.firstName} ${studentData?.lastName}`,
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
  
      // Stop loading and open Razorpay payment popup
      setLoading(false);
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
  
      // Handle payment failure
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        setFailedDialogOpen(true); // Open failed dialog
      });
    } catch (error) {
      console.error('Error during payment:', error);
      setLoading(false);
      setFailedDialogOpen(true);
    }
  };
  

  const validateBeforeSubmit = () => {    
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
 
    const apiPayload = {
      studentData: {
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        mobileNumber: data?.studentData?.contact || studentData?.mobileNumber,
        isMobileVerified: studentData?.isMobileVerified || false,
        email: studentData?.email || '',
        qualification: data?.studentData?.currentStatus || studentData?.qualification,
        program: data?.studentData?.courseOfInterest || studentData?.program,
        cohort: data?.studentData?.cohort || studentData?.cohort,
        gender: data.studentData.gender,
        isVerified: studentData?.isVerified || false,
        dateOfBirth: new Date(data?.studentData?.dob || studentData?.dateOfBirth), 
        linkedInUrl: data.studentData.linkedInUrl || "",
        instagramUrl: data.studentData.instagramUrl || "",
      },
      profileImage: imagePreview,
      applicationData: {
        currentAddress: {
          streetAddress: data.applicationData.address,
          city: data.applicationData.city,
          state: "", // Optional: Add state if available
          postalCode: data.applicationData.zipcode,
        },
        previousEducation: {
          highestLevelOfEducation: data.applicationData.educationLevel,
          fieldOfStudy: data.applicationData.fieldOfStudy,
          nameOfInstitution: data.applicationData.institutionName,
          yearOfGraduation: data.applicationData.graduationYear,
        },
        workExperience: {
          isExperienced: data.applicationData.isExperienced,
          experienceType: data.applicationData.experienceType || '',
          nameOfCompany: data.applicationData.nameOfCompany || '',
          duration: data.applicationData.duration || '',
          jobDescription: data.applicationData.jobDescription || '',
        },
        emergencyContact: {
          firstName: data.applicationData.emergencyFirstName,
          lastName: data.applicationData.emergencyLastName,
          contactNumber: data.applicationData.emergencyContact,
          relationshipWithStudent: data.applicationData.relationship,
        },
        parentInformation: {
          father: {
            firstName: data.applicationData.fatherFirstName,
            lastName: data.applicationData.fatherLastName,
            contactNumber: data.applicationData.fatherContact,
            occupation: data.applicationData.fatherOccupation,
            email: data.applicationData.fatherEmail,
          },
          mother: {
            firstName: data.applicationData.motherFirstName,
            lastName: data.applicationData.motherLastName,
            contactNumber: data.applicationData.motherContact,
            occupation: data.applicationData.motherOccupation,
            email: data.applicationData.motherEmail,
          },
        },
        financialInformation: {
          isFinanciallyIndependent: !data.applicationData.financiallyDependent,
          hasAppliedForFinancialAid: data.applicationData.appliedForFinancialAid,
        },
      },
    };

  try {
    setLoading(true);
    console.log("dssd",apiPayload);
    
    const response = await fetch('https://myfashionfind.shop/student/submit-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload), 
    });

    if (response.ok) {
      // Handle success response
      console.log('Form submitted successfully', response);
      setIsPaymentDialogOpen(true);
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

  const onSubmit = async (data: FormData) => {
      console.log("save",studentData?.applicationDetails, isSaved);
      await saveData(data);
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
          {/* <div className="w-full sm:w-[232px] h-[308px] bg-[#1F1F1F] flex flex-col items-center justify-center rounded-xl text-sm space-y-4">
      {previewUrl ? (
        <div className="w-full h-full relative">
          <img
            src={previewUrl}
            alt="Passport Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              className="p-2 bg-white/10 mix-blend-difference border border-white rounded-full hover:bg-white/20"
              onClick={() => {
                setImagePreview(null);
                setPreviewUrl('')
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
                console.log("fefs",imageUrl,file);
                
                setImagePreview(file);
                setPreviewUrl(imageUrl);
                setStudentData({ ...studentData, profileUrl: file });
              }
            }}
          />
        </label>
        </>
      )}
    </div> */}


          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Full Name */}
            <FormField
              control={control}
              name="studentData.firstName"
              render={({ field }) => (
                <FormItem className='flex-1 space-y-1'>
                  <Label className="text-base font-normal pl-3">Full Name</Label>
                  <FormControl>
                    <Input id="fullName" defaultValue={((studentData?.firstName || "-")+' '+(studentData?.lastName || "-"))} placeholder="John Doe" disabled/>
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
                name="studentData.email"
                render={({ field }) => (
                  <FormItem className='flex-1 space-y-1 relative'>
                    <CheckCircle className="text-[#00CC92] absolute left-3 top-[52px] w-5 h-5 " />
                    <Label className="text-base font-normal pl-3">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        disabled
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
                name="studentData.contact"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    {studentData?.isMobileVerified ? 
                      <CheckCircle className="text-[#00CC92] absolute left-3 top-[52px] w-5 h-5 " /> : 
                      <Phone className="absolute left-3 top-[52px] w-5 h-5 " />
                    }
                    <Label className="text-base font-normal pl-3">Contact No.</Label>
                    <FormControl>
                      <Input disabled={isSaved}
                        id="contact"
                        type="tel"
                        placeholder="+91 95568 97688"
                        className='pl-10'
                        defaultValue={studentData?.mobileNumber}
                        {...field}
                      />
                    </FormControl>
                    {studentData?.isMobileVerified ?
                      <Phone className="absolute right-3 top-[46px] w-5 h-5" /> : 
                      <Button size='sm' className='absolute right-3 top-10 rounded-full px-4 bg-[#00CC92]' onClick={() => handleVerifyClick(studentData?.mobileNumber)} type="button">
                        Verify
                      </Button>
                    }
                    {errors?.studentData?.contact ? (
                      <FormMessage />
                    ) : (
                      !studentData?.isMobileVerified && (
                        <div className="text-red-500 text-sm font-medium pl-3">
                          Please verify your mobile number before submitting.
                        </div>
                      )
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth and Current Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Date of Birth */}
              <FormField
                control={control}
                name="studentData.dob"
                render={({ field }) => {
                  const maxDate = new Date();
                  maxDate.setFullYear(maxDate.getFullYear() - 16); // Subtract 16 years from today's date
                  const maxDateString = maxDate.toISOString().split('T')[0];
                  return (
                  <FormItem className="flex-1 flex flex-col space-y-1 relative">
                    <Label className="text-base font-normal pl-3">Date of Birth</Label>
                    <FormControl>
                    <input
                      type="date"
                      disabled={isSaved}
                      className="!h-[64px] bg-[#09090B] px-3 uppercase rounded-xl border"
                      id="dob"
                      name="dateOfBirth"
                      defaultValue={studentData?.dateOfBirth ? format(new Date(studentData.dateOfBirth || field.value), "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value;
                        field.onChange(date);
                      }}
                      max={maxDateString}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}}
              />
              {/* Currently a */}
              <FormField
                control={control}
                name="studentData.currentStatus"
                render={({ field }) => (
                  <FormItem className='flex-1 space-y-1'>
                    <Label className="text-base font-normal pl-3">You are Currently a</Label>
                    <FormControl>
                      <Select disabled={isSaved} value={field.value} onValueChange={field.onChange}>
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
                      {/* <Input id="currentStatus" type="text" placeholder="College Student" defaultValue={studentData?.qualification} /> */}
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
            name="studentData.courseOfInterest"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label className='text-base font-normal pl-3'>Course of Interest</Label>
                <FormControl>
                  <Select disabled={isSaved}
                  onValueChange={(value) => { field.onChange(value); (value); }} 
                  value={field.value}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Map(interest.map((int) => [int.programDetail, int])).values()).map((int) => (
                        <SelectItem key={int.programDetail} value={int.programDetail}>
                          {getProgramName(int.programDetail)}
                        </SelectItem>
                      ))}
                      {/* <SelectItem value={studentData?.program}>{getProgramName(studentData?.program)}</SelectItem> */}
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
            name="studentData.cohort"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label className='text-base font-normal pl-3'>Select Cohort</Label>
                <FormControl>
                  <Select disabled={isSaved}
                    onValueChange={(value) => { field.onChange(value); (value); }} 
                    value={field.value}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map((cohort) => (
                                          <SelectItem key={cohort._id} value={cohort._id}>{formatDateToMonthYear(cohort.startDate)} ({cohort.timeSlot}), {getCenterName(cohort?.centerDetail)}</SelectItem>
                                        ))}
                        {/* <SelectItem key={studentData?.cohort} value={studentData?.cohort}>{getCohortName(studentData?.cohort)}</SelectItem> */}
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
            name="studentData.linkedInUrl"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-base font-normal pl-3">Your LinkedIn ID (Not Compulsory)</Label>
                <FormControl>
                  <Input id="linkedInUrl" placeholder="linkedin.com/in" {...field} 
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\s/g, "");
                    field.onChange(newValue);
                  }} disabled={isSaved}/>
                </FormControl>
                <Linkedin className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Instagram ID */}
          <FormField
            control={control}
            name="studentData.instagramUrl"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-base font-normal pl-3">Your Instagram ID (Not Compulsory)</Label>
                <FormControl>
                  <Input id="instagramUrl" placeholder="@JohnDoe" {...field} 
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\s/g, "");
                    field.onChange(newValue);
                  }} disabled={isSaved}/>
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
          name="studentData.gender"
          render={({ field }) => (
            <FormItem className='flex-1 space-y-1 pl-3'>
              <Label className="text-base font-normal">Select Your Gender</Label>
              <FormControl>
                <RadioGroup disabled={isSaved}
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
          name="applicationData.address"
          render={({ field }) => (
            <FormItem className='flex-1 space-y-1'>
              <Label htmlFor="address" className="text-base font-normal pl-3">Your Current Address</Label>
              <FormControl>
                <Input id="address" placeholder="Street Address" {...field} disabled={isSaved} />
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
            name="applicationData.city"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="city" className="text-base font-normal pl-3">City, State</Label>
                <FormControl>
                  <Input id="city" placeholder="City, State" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Zip Code */}
          <FormField
            control={control}
            name="applicationData.zipcode"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="zipcode" className="text-base font-normal pl-3">Postal/Zip Code</Label>
                <FormControl>
                  <Input maxLength={6} id="zipcode" placeholder="Postal/Zip Code" {...field} 
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9+ ]/g, '');
                    field.onChange(target.value);
                  }} disabled={isSaved}/>
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
            name="applicationData.educationLevel"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="educationLevel" className="text-base font-normal pl-3">Highest Level of Education Attained</Label>
                <FormControl>
                  <Select disabled={isSaved}
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
            name="applicationData.fieldOfStudy"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fieldOfStudy" className="text-base font-normal pl-3">Field of Study (Your Major)</Label>
                <FormControl>
                  <Input id="fieldOfStudy" placeholder="Type here" {...field} disabled={isSaved} />
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
            name="applicationData.institutionName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="institutionName" className="text-base font-normal pl-3">Name of Institution</Label>
                <FormControl>
                  <Input id="institutionName" placeholder="Type here" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Graduation Year */}
          <FormField
            control={control}
            name="applicationData.graduationYear"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col space-y-1">
                <Label htmlFor="graduationYear" className="text-base font-normal pl-3">Year of Graduation</Label>
                <FormControl>
                  <input 
                    placeholder="MM YYYY"
                    type="month"
                    className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                    id="graduationYear" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Experience */}
        <FormField
          control={control}
          name="applicationData.isExperienced"
          render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1 pl-3">
                <Label className="text-base font-normal">Do you have any work experience?</Label>
                <FormControl>
                  <RadioGroup disabled={isSaved}
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
                name="applicationData.experienceType"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label htmlFor="experienceType" className="text-base font-normal pl-3">Select Your Latest Work Experience Type</Label>
                    <FormControl>
                      <Select value={field.value} disabled={isSaved}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setExperienceType(value as ExperienceType);
                          }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Working Professional">Employee</SelectItem>
                          <SelectItem value="Freelancer">Freelancer</SelectItem>
                          <SelectItem value="Business Owner">Business Owner</SelectItem>
                          <SelectItem value="Consultant">Consultant</SelectItem>
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
                name="applicationData.jobDescription"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label htmlFor="jobDescription" className="text-base font-normal pl-3">Latest Job/Service Description</Label>
                    <FormControl>
                      <Input id="jobDescription" placeholder="Type here" {...field} disabled={isSaved} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Fields Based on Experience Type */}
            {watchExperienceType === 'Working Professional' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Company Name */}
                <FormField
                  control={control}
                  name="applicationData.nameOfCompany"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company (Latest or Current)</Label>
                      <FormControl>
                        <Input id="companyName" placeholder="Type here" {...field} disabled={isSaved} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Work Duration */}
                <div className='flex-1 space-y-1'>
                <Label htmlFor="duration" className="text-base font-normal pl-3">Apx. Duration of Work</Label>
                  <div className="flex flex-1 items-center gap-2">
                  <FormField
                    control={control}
                    name="applicationData.durationFrom"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationFrom"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationFrom && (
                            <span className="text-red-500">{errors.applicationData.durationFrom.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <Minus className='w-4 h-4'/>

                  <FormField
                    control={control}
                    name="applicationData.durationTo"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationTo"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationTo && (
                            <span className="text-red-500">{errors.applicationData.durationTo.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>  
            )}

            {watchExperienceType === 'Business Owner' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Company Name */}
                <FormField
                  control={control}
                  name="applicationData.nameOfCompany"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="companyName" className="text-base font-normal pl-3">Name of Company</Label>
                      <FormControl>
                        <Input id="companyName" placeholder="Type here" {...field} disabled={isSaved} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Company Start Date */}
                <FormField
                  control={control}
                  name="applicationData.duration"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label htmlFor="companyStartDate" className="text-base font-normal pl-3">When Did You Start Your Company?</Label>
                      <FormControl>
                        <input 
                          placeholder="MM/YYYY" 
                          type="month"
                          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
                          id="companyStartDate" {...field} disabled={isSaved} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchExperienceType === 'Freelancer' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Duration of Work */}
                <div className='flex-1 space-y-1'>
                <Label htmlFor="duration" className="text-base font-normal pl-3">Apx. Duration of Work</Label>
                  <div className="flex flex-1 items-center gap-2">
                  <FormField
                    control={control}
                    name="applicationData.durationFrom"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationFrom"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationFrom && (
                            <span className="text-red-500">{errors.applicationData.durationFrom.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <Minus className='w-4 h-4'/>

                  <FormField
                    control={control}
                    name="applicationData.durationTo"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationTo"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationTo && (
                            <span className="text-red-500">{errors.applicationData.durationTo.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            )}

            {watchExperienceType === 'Consultant' && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Duration of Work */}
                <div className='flex-1 space-y-1'>
                <Label htmlFor="duration" className="text-base font-normal pl-3">Apx. Duration of Work</Label>
                  <div className="flex flex-1 items-center gap-2">
                  <FormField
                    control={control}
                    name="applicationData.durationFrom"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationFrom"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationFrom && (
                            <span className="text-red-500">{errors.applicationData.durationFrom.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <Minus className='w-4 h-4'/>

                  <FormField
                    control={control}
                    name="applicationData.durationTo"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="month"
                            id="durationTo"
                            {...field}
                            disabled={isSaved}
                            className="!h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                          />
                        </FormControl>
                        <FormMessage>
                          {errors.applicationData?.durationTo && (
                            <span className="text-red-500">{errors.applicationData.durationTo.message}</span>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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
            name="applicationData.emergencyFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="emergencyFirstName" className="text-base font-normal pl-3">First Name</Label>
                <FormControl>
                  <Input id="emergencyFirstName" placeholder="John" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Emergency Contact Last Name */}
          <FormField
            control={control}
            name="applicationData.emergencyLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="emergencyLastName" className="text-base font-normal pl-3">Last Name</Label>
                <FormControl>
                  <Input id="emergencyLastName" placeholder="Doe" {...field} disabled={isSaved} />
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
            name="applicationData.emergencyContact"
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
                  }} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Relationship */}
          <FormField
            control={control}
            name="applicationData.relationship"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="relationship" className="text-base font-normal pl-3">Relationship with Contact</Label>
                <FormControl>
                  <Input id="relationship" placeholder="Father/Mother/Sibling" {...field} disabled={isSaved} />
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
            name="applicationData.fatherFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherFirstName" className="text-base font-normal pl-3">Father's First Name</Label>
                <FormControl>
                  <Input id="fatherFirstName" placeholder="John" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Last Name */}
          <FormField
            control={control}
            name="applicationData.fatherLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherLastName" className="text-base font-normal pl-3">Father's Last Name</Label>
                <FormControl>
                  <Input id="fatherLastName" placeholder="Doe" {...field} disabled={isSaved} />
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
            name="applicationData.fatherContact"
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
                  }} disabled={isSaved}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Occupation */}
          <FormField
            control={control}
            name="applicationData.fatherOccupation"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherOccupation" className="text-base font-normal pl-3">Father's Occupation</Label>
                <FormControl>
                  <Input id="fatherOccupation" placeholder="Type here" {...field} disabled={isSaved} />
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
            name="applicationData.fatherEmail"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="fatherEmail" className="text-base font-normal pl-3">Father's Email</Label>
                <FormControl>
                  <Input id="fatherEmail" placeholder="Doe" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="applicationData.motherFirstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherFirstName" className="text-base font-normal pl-3">Mother's First Name</Label>
                <FormControl>
                  <Input id="motherFirstName" placeholder="John" {...field} disabled={isSaved} />
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
            name="applicationData.motherLastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherLastName" className="text-base font-normal pl-3">Mother's Last Name</Label>
                <FormControl>
                  <Input id="motherLastName" placeholder="Doe" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mother's Contact Number */}
          <FormField
            control={control}
            name="applicationData.motherContact"
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
                  }} disabled={isSaved}/>
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
            name="applicationData.motherOccupation"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherOccupation" className="text-base font-normal pl-3">Mother's Occupation</Label>
                <FormControl>
                  <Input id="motherOccupation" placeholder="Type here" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mother's First Name */}
          <FormField
            control={control}
            name="applicationData.motherEmail"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="motherEmail" className="text-base font-normal pl-3">Mother's Email</Label>
                <FormControl>
                  <Input id="motherEmail" placeholder="John" {...field} disabled={isSaved} />
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
            name="applicationData.financiallyDependent"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-base font-normal">Are you financially dependent on your Parents?</Label>
                <FormControl>
                  <RadioGroup disabled={isSaved}
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
            name="applicationData.appliedForFinancialAid"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-base font-normal">Have you tried applying for financial aid earlier?</Label>
                <FormControl>
                  <RadioGroup disabled={isSaved}
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
        </div>
 
        <div className="flex justify-between items-center mt-10">
          <Button variant="link" type='button' onClick={() => form.reset() }>Clear Form</Button>
          {isPaymentDone ?
          <Button size="xl" className='px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="button" onClick={() => handleContinueToDashboard()} disabled={loading}>
            <div className='flex items-center gap-2'>
              {loading ? 'Redirecting...' : 'Continue to Dashboard'}
            </div>
          </Button> :
          isSaved ?
          <Button size="xl" className='px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="button" onClick={() => handlePayment()} disabled={loading}>
            <div className='flex items-center gap-2'>
              {loading ? 'Initializing Payment...' : 'Pay INR ₹500.00'}
            </div>
          </Button> :
          <Button size="xl" className='px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="submit" disabled={loading}>
          <div className='flex items-center gap-2'>
            <SaveIcon className='w-5 h-5' />{loading ? 'Submitting...' : 'Submit'}
          </div>
        </Button>}
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
    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
    <DialogContent className="max-w-[500px] mx-4 bg-[#09090b] text-white rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
      <img src='/assets/images/make-payment.svg' className="mx-auto mb-8" />
      <div>
        <div className="text-2xl font-semibold ">Admission Fee Payment</div>
        <div className="mt-2 text-base font-normal text-center">
          Make an admission fee payment of INR 500 to move to the next step of your admission process
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="xl" className='px-4 mx-auto bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="button" onClick={() => handlePayment()} disabled={loading}>
          <div className='flex items-center gap-2'>
            {loading ? 'Initializing Payment...' : 'Make Payment'}
          </div>
        </Button>
      </div>
    </DialogContent>
    </Dialog>
    <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleContinueToDashboard}/>
    <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleRetry}/>
    </>
  );
};

export default ApplicationDetailsForm;
