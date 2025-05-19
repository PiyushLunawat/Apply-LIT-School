// Import necessary modules and components
"use client";
import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { Calendar, Camera, CheckCircle, Clipboard, ClipboardCheck, Instagram, Linkedin, Mail, Minus, Phone, SaveIcon, XIcon } from 'lucide-react';
import { UserContext } from '~/context/UserContext';
import { getCentres, getCohorts, getCurrentStudent, getPrograms, payApplicationFee, submitApplication, verifyApplicationFeePayment } from '~/api/studentAPI';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { verifyNumber } from '~/api/authAPI';
import { format } from 'date-fns';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from 'firebase.config';
import VerifyOTP from '~/layout/auth-layout/components/VerifyOTP';
import { PaymentFailedDialog, PaymentSuccessDialog } from '~/components/molecules/PaymentDialog/PaymentDialog';
import { useNavigate } from '@remix-run/react';

type ExperienceType = 'Working Professional' | 'Business Owner' | 'Freelancer' | 'Consultant';

const formSchema = z.object({
  studentData: z.object({   
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    contact: z.string().optional(),
    dob: z.string(),
    currentStatus: z.string(),
    courseOfInterest: z.string(),
    cohort: z.string(),
    isMobileVerified: z.boolean().optional(),
    linkedInUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    gender: z.enum(["male", "female", "other"]),
  }),
  profileUrl: z.any().optional(),
  applicationData: z.object({  
    address: z.string().nonempty("Address is required"),
    city: z.string().nonempty("City & State is required"),
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
    fatherEmail: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),  
    motherFirstName: z.string().optional(),
    motherLastName: z.string().optional(),
    motherContact: z.string().optional(),
    motherOccupation: z.string().optional(),
    motherEmail: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
    financiallyDependent: z.boolean(),
    appliedForFinancialAid: z.boolean(),
  }),
})
.refine(
  (data) => data.studentData.isMobileVerified,
  {
    message: "Mobile number needs to be verified.",
    path: ["studentData.contact"], // Attach error to contact field
  }
)
.refine(
  (data) => {
    const url = data.studentData.linkedInUrl;
    if (!url) return true; 
    return typeof url === "string" && /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(url);
  },
  {
    message: "Please enter a valid LinkedIn URL.",
    path: ["studentData.linkedInUrl"],
  }
)
.refine(
  (data) => !data.applicationData.isExperienced || (data.applicationData.experienceType),
  {
    message: "Experience Type is required.",
    path: ["applicationData.experienceType"], 
  }
)
.refine(
  (data) => !data.applicationData.isExperienced || (data.applicationData.jobDescription),
  {
    message: "Job Description is required.",
    path: ["applicationData.jobDescription"], 
  }
)
.refine(
  (data) =>
    !data.applicationData.isExperienced ||
    !['Working Professional', 'Business Owner', 'Consultant'].includes(data.applicationData.experienceType || '') ||
    data.applicationData.nameOfCompany,
  {
    message: "Company name is required.",
    path: ["applicationData.nameOfCompany"],
  }
)
.refine(
  (data) =>
    !data.applicationData.isExperienced ||
    !['Business Owner'].includes(data.applicationData.experienceType || '') ||
    data.applicationData.duration,
  {
    message: "Duration is required.",
    path: ["applicationData.duration"],
  }
)
.refine(
  (data) =>
    !data.applicationData.isExperienced ||
    !["Working Professional", "Freelancer", "Consultant"].includes(data.applicationData.experienceType || '') ||
    data.applicationData.duration,
  {
    message: "Duration is required.",
    path: ["applicationData.durationFrom"],
  }
)
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
    path: ["applicationData.motherOccupation"], // Add error to the root of applicationData
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
  (data) => (data.applicationData.fatherContact !== data.applicationData.motherContact ||
    !data.applicationData.fatherContact
  ),
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
  (data) => (data.applicationData.fatherEmail !== data.applicationData.motherEmail || 
    !data.applicationData.fatherEmail
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [interest, setInterest] = useState<any[]>([]); 
  const [cohorts, setCohorts] = useState<any[]>([]); 
  const [contactInfo, setContactInfo] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [fetchedStudentData, setFetchedStudentData] = useState<any>(null);
  const [applicationFees, setApplicationFees] = useState(0);

  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTopVisible, setIsTopVisible] = useState(true);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  const navigate = useNavigate();

  const [programs, setPrograms] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);

  // All open cohorts from the server
  const [openCohorts, setOpenCohorts] = useState<any[]>([]);

  // Unique Program IDs extracted from openCohorts for the "Course of Interest" dropdown
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);

  // Cohorts filtered by the user's chosen program
  const [filteredCohorts, setFilteredCohorts] = useState<any[]>([]);

  useEffect(() => {
  const topObserver = new IntersectionObserver(
    ([entry]) => setIsTopVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );

  const bottomObserver = new IntersectionObserver(
    ([entry]) => setIsBottomVisible(entry.isIntersecting),
    { threshold: 0.1 }
  );

  if (topRef.current) topObserver.observe(topRef.current);
  if (bottomRef.current) bottomObserver.observe(bottomRef.current);

  return () => {
    if (topRef.current) topObserver.unobserve(topRef.current);
    if (bottomRef.current) bottomObserver.unobserve(bottomRef.current);
  };
}, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Load all programs, centres, and cohorts
        const programsData = await getPrograms();
        setPrograms(programsData.data);

        const centresData = await getCentres();
        setCentres(centresData.data);

        const cohortsData = await getCohorts();

        // 2. Filter only OPEN cohorts
        const open = cohortsData.data.filter((cohort: any) => cohort.status === "Open");
        setOpenCohorts(open);

        // 3. Extract unique program IDs from openCohorts
        const uniquePrograms = Array.from(
          new Set(open.map((cohort: any) => cohort.programDetail))
        );
        setAvailablePrograms(uniquePrograms);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

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
        
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    }
    fetchCohorts();
  }, []);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, formState: { errors, isValid }, reset, setValue, watch } = form;

  useEffect(() => {
    const selectedProgram = form.watch("studentData.courseOfInterest");
    if (!selectedProgram) {
      // No program chosen yet—empty the "Select Cohort" list
      setFilteredCohorts([]);
      return;
    }
  
    // Filter openCohorts by the chosen program ID
    const matching = openCohorts.filter(
      (cohort) => cohort.programDetail === selectedProgram
    );
    setFilteredCohorts(matching);
  }, [form.watch("studentData.courseOfInterest"), openCohorts]);

// Move the watched value outside the useEffect
const currentStatus = form.watch("studentData.currentStatus");

useEffect(() => {
  if (currentStatus) {
    const isExp = ['Working Professional', 'Freelancer', 'Business Owner', 'Consultant']
      .includes(currentStatus);
      const expType = (['Working Professional', 'Business Owner', 'Freelancer', 'Consultant']
        .includes(currentStatus) ? currentStatus : '') as "" | "Working Professional" | "Business Owner" | "Freelancer" | "Consultant";

    form.setValue('applicationData.isExperienced', isExp);
    form.setValue('applicationData.experienceType', expType);
  }
}, [currentStatus]); // Now using the watched value as dependency

  useEffect(() => {
    const fetchStudentData = async () => {
      if(studentData._id)
      try {
        const student = await getCurrentStudent(studentData._id);
        // console.log("dbab",student);
         if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'enrolled'){
          navigate('../../dashboard');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'reviewing'){
          navigate('../../application/status');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'applied'){
          navigate('../../application/task');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'initiated'){
          navigate('../../application');
        } else if (student?.appliedCohorts[student?.appliedCohorts.length - 1]?.status === 'dropped'){
          navigate('../../application/new-application');
        } else {
          navigate('../../application');
        }
        
        setFetchedStudentData(student);
        
        const sData = student?.appliedCohorts[student.appliedCohorts.length - 1]?.applicationDetails?.studentDetails;
        
        // Payment or "isSaved" checks
        if (student?.appliedCohorts[student.appliedCohorts.length - 1]?.applicationDetails?.studentDetails !== undefined && student?.appliedCohorts[student.appliedCohorts.length - 1]?.applicationDetails?.applicationStatus !== 'incomplete') {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
        if (student?.appliedCohorts[student.appliedCohorts.length - 1]?.applicationDetails?.applicationFee === "paid") {
          setIsPaymentDone(true);
        }

        // Read existing localStorage data, if any
        const existingDataJSON = localStorage.getItem(`applicationDetailsForm-${studentData?.email}`);
        let existingData: any = null;
        if (existingDataJSON) {
          existingData = JSON.parse(existingDataJSON);
        }
        
        const isExistingDataEmpty =
        existingData &&
        existingData.studentData &&
        Object.keys(existingData.studentData).length === 0 &&
        existingData.applicationData &&
        existingData.applicationData?.duration === "";
        
        setApplicationFees(fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId?.cohortFeesDetail?.applicationFee)
        // 3. Decide how to build mergedForm
        let mergedForm;
        if (isExistingDataEmpty) {
          // If everything in local storage is empty, use the data from sData
          mergedForm = {
            studentData: {
              firstName: studentData?.firstName || '',
              lastName: studentData?.lastName || '',
              email: studentData?.email || '',
              contact: student?.mobileNumber || studentData?.mobileNumber,
              dob: studentData?.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
              currentStatus: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification || '',
              courseOfInterest: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?._id || '',
              cohort: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId._id || '',
              isMobileVerified: student?.isMobileVerified || false,
              linkedInUrl: studentData?.linkedInUrl || '',
              instagramUrl: studentData?.instagramUrl || '',
              gender: studentData?.gender || 'male',
            },
            applicationData: {
              address: sData?.currentAddress?.streetAddress || '',
              city: sData?.currentAddress?.city || '',
              zipcode: sData?.currentAddress?.postalCode || '',
              educationLevel: sData?.previousEducation?.highestLevelOfEducation || '',
              fieldOfStudy: sData?.previousEducation?.fieldOfStudy || '',
              institutionName: sData?.previousEducation?.nameOfInstitution || '',
              graduationYear: sData?.previousEducation?.yearOfGraduation || '',
              isExperienced:
                sData?.workExperience?.isExperienced ||
                ['Working Professional', 'Freelancer', 'Business Owner', 'Consultant'].includes(studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification) ||
                false,
              experienceType:
                sData?.workExperience?.experienceType ||
                (['Working Professional', 'Business Owner', 'Freelancer', 'Consultant'].includes(studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification)
                  ? studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification
                  : ''),
              nameOfCompany: sData?.workExperience?.nameOfCompany || '',
              durationFrom: '',
              durationTo: '',
              duration: sData?.workExperience?.duration || '',
              jobDescription: sData?.workExperience?.jobDescription || '',
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
            },
          };
        } else
        { mergedForm = {
          studentData: {
            // Default to your known fields first
            firstName: studentData?.firstName || "",
            lastName: studentData?.lastName || "",
            email: studentData?.email || "",
            courseOfInterest: existingData?.studentData?.courseOfInterest || studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?._id || "",
            cohort: existingData?.studentData?.cohort || studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.cohortId._id || "",
            isMobileVerified: student?.isMobileVerified || false,
            contact: existingData?.studentData?.contact || studentData?.mobileNumber || "",
            dob: existingData?.studentData?.dob.split("T")[0] || studentData.dateOfBirth.split("T")[0],
            currentStatus: existingData?.studentData?.currentStatus ||  studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification || "",
            linkedInUrl: existingData?.studentData?.linkedInUrl || studentData?.linkedInUrl || "",
            instagramUrl: existingData?.studentData?.instagramUrl || studentData?.instagramUrl || "",
            gender: existingData?.studentData?.gender || studentData?.gender || "male",
          },
  
          applicationData: {
            // Use existingData first if it’s relevant, otherwise fallback to sData or defaults
            address: existingData?.applicationData?.address || "",
            city: existingData?.applicationData?.city || "",
            zipcode: existingData?.applicationData?.zipcode || "",
            educationLevel:
              existingData?.applicationData?.educationLevel || "",
            fieldOfStudy: existingData?.applicationData?.fieldOfStudy || "",
            institutionName:
              existingData?.applicationData?.institutionName || "",
            graduationYear:
              existingData?.applicationData?.graduationYear || "",
            isExperienced:
              existingData?.applicationData?.isExperienced ||
              ["Working Professional", "Freelancer", "Business Owner", "Consultant"].includes(
                studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification
              ) ||
              false,
            experienceType:
              existingData?.applicationData?.experienceType ||
              (["Working Professional", "Business Owner", "Freelancer", "Consultant"].includes(
                studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification
              )
                ? studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification
                : ""),
            nameOfCompany: existingData?.applicationData?.nameOfCompany || "",
            durationFrom: existingData?.applicationData?.durationFrom || "",
            durationTo: existingData?.applicationData?.durationTo || "",
            duration: existingData?.applicationData?.duration || "",
            jobDescription: existingData?.applicationData?.jobDescription || "",
            emergencyFirstName: existingData?.applicationData?.emergencyFirstName || "",
            emergencyLastName: existingData?.applicationData?.emergencyLastName || "",
            emergencyContact: existingData?.applicationData?.emergencyContact || "",
            relationship: existingData?.applicationData?.relationship || "",
            fatherFirstName:
              existingData?.applicationData?.fatherFirstName || "",
            fatherLastName:
              existingData?.applicationData?.fatherLastName || "",
            fatherContact:
              existingData?.applicationData?.fatherContact || "",
            fatherOccupation:
              existingData?.applicationData?.fatherOccupation || "",
            fatherEmail:
              existingData?.applicationData?.fatherEmail || "",
            motherFirstName:
              existingData?.applicationData?.motherFirstName || "",
            motherLastName:
              existingData?.applicationData?.motherLastName || "",
            motherContact:
              existingData?.applicationData?.motherContact || "",
            motherOccupation:
              existingData?.applicationData?.motherOccupation || "",
            motherEmail:
              existingData?.applicationData?.motherEmail || "",
            financiallyDependent:
              existingData?.applicationData?.financiallyDependent ||
              false,
            appliedForFinancialAid:
              existingData?.applicationData?.appliedForFinancialAid ||
              false,
          },
        };
      }
        // Finally, reset the form with merged data
        reset(mergedForm);

      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };
  
    fetchStudentData();
  }, [studentData, interest]);
  

//   useEffect(() => {
//   // If we don't have studentData yet, or if there's no user ID,
//   // skip until we have the data we need
//   if (!studentData || !studentData._id || interest) return;

//   // Check if something already exists in localStorage
//   const existingData = localStorage.getItem("applicationDetailsForm");

//   // If nothing is stored yet, we create a minimal object with those three fields
//   if (!existingData) {
//     const initialForm = {
//       // Only the fields you want to seed
//       studentData: {
//         currentStatus: studentData?.qualification || "",
//         courseOfInterest: studentData?.program || "",
//         cohort: studentData?.cohort || "",
//       },
//       // Everything else can remain empty or undefined
//       applicationData: {},
//     };

//     localStorage.setItem("applicationDetailsForm", JSON.stringify(initialForm));
//   }
// }, [studentData, interest]);


  useEffect(() => {
    const storedFormJSON = localStorage.getItem(`applicationDetailsForm-${studentData?.email}`);
    if (storedFormJSON) {
      try {
        const parsedForm = JSON.parse(storedFormJSON);
        reset(parsedForm);
      } catch (error) {
        console.error("Error parsing form data from Local Storage:", error);
      }
    }
  }, [reset]);

  // 2) Whenever the form data changes, update Local Storage in real time
  useEffect(() => {
    // .watch() returns the entire form state on every change
    const subscription = watch((value) => {
      if (studentData?.email)
      localStorage.setItem(`applicationDetailsForm-${studentData?.email}`, JSON.stringify(value));
    });
    // unsubscribe on unmount
    return () => subscription.unsubscribe();
  }, [watch, studentData?.email]);
  

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

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const handleVerifyClick = async (contact: string) => {
    if (typeof window === 'undefined') return;
    setOtpLoading(true);
  
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
  
      const confirmationResult = await signInWithPhoneNumber(auth, contact, recaptchaVerifierRef.current);
      setVerificationId(confirmationResult.verificationId);
      setContactInfo(contact);
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error('Error verifying number:', error);
      form.setError('studentData.contact', {
        type: 'manual',
        message: error.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setOtpLoading(false);
    }
  };
  

// useEffect to ensure RecaptchaVerifier is initialized on the client side
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Ensure recaptcha container exists for Firebase RecaptchaVerifier
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
      const div = document.createElement('div');
      div.id = 'recaptcha-container';
      document.body.appendChild(div);
    }
  }
}, []);

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

  const formatDateToMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleContinueToDashboard = () => {
    window.location.href = '/application/task';
    setSuccessDialogOpen(false);
    localStorage.removeItem(`applicationDetailsForm-${studentData?.email}`);
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
      
        setLoading(false);
        return;
      }

      const verifyPaymentStatus=async (orderId:any)=>{

        const res= await fetch('')
    console.log(res);
    
      }
  
      // Fetch application fee amount
      const applicationFee = applicationFees || 500;
      const sId = fetchedStudentData._id;
      const cId = fetchedStudentData.appliedCohorts[fetchedStudentData.appliedCohorts.length - 1].cohortId._id;
  
      // Call the API to create an order

      const feePayLoad = {
        studentId: sId,
        cohortId: cId 
      }
      console.log("sdfdv",feePayLoad);
      
      const feeResponse = await payApplicationFee(feePayLoad);
      console.log("Fee payment response:", feeResponse);
  
      // Configure Razorpay options
      const options = {
        key: 'rzp_test_1wAgBK19fS5nhr', // Replace with your Razorpay API key
        amount: feeResponse.data.amount, // Amount in currency subunits
        currency: feeResponse.data.currency,
        name: 'The LIT School',
        description: 'Application Fee',
        image: 'https://example.com/your_logo', // Replace with your logo URL
        order_id: feeResponse.data.orderId, // Use the order ID returned from the server
        handler: async function (response: any) {
          
          // Verify the payment on the server
          try {
            const verifyResponse = await verifyApplicationFeePayment(feeResponse.data.orderId,);
            console.log("Payment verification response:", verifyResponse);
  
            if (verifyResponse.success) {
              setIsPaymentDone(true);
              setSuccessDialogOpen(true);
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
  
  // Handle form submission
  const submitData = async (data: FormData) => { 
    const apiPayload = {
      cohortId: data.studentData?.cohort,
      // studentDetailId: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.applicationDetails?.studentDetails?._id,
      studentData: {
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        mobileNumber: studentData?.mobileNumber || '',
        isMobileVerified: studentData?.isMobileVerified || false,
        email: studentData?.email || '',
        qualification: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification || '',
        program: data.studentData?.courseOfInterest || '',
        cohort: data.studentData?.cohort || '',
        gender: data.studentData.gender,
        isVerified: studentData?.isVerified || false,
        dateOfBirth: new Date(studentData?.dateOfBirth || Date.now()), 
        profileImage: [],
        linkedInUrl: data.studentData.linkedInUrl || "",
        instagramUrl: data.studentData.instagramUrl || "",
      },
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
    
    const response = await fetch('https://dev.apply.litschool.in/student/submit-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload), 
    });

    if (response.ok) {
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

  const saveData = async (data: FormData) => { 
    const apiPayload = {
      cohortId: data.studentData?.cohort,
      studentDetailId: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.applicationDetails?.studentDetails?._id,
      studentData: {
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        mobileNumber: studentData?.mobileNumber || '',
        isMobileVerified: studentData?.isMobileVerified || false,
        email: studentData?.email || '',
        qualification: studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]?.qualification || '',
        program: data.studentData?.courseOfInterest || '',
        cohort: data.studentData?.cohort || '',
        gender: data.studentData.gender,
        isVerified: studentData?.isVerified || false,
        dateOfBirth: new Date(studentData?.dateOfBirth || Date.now()), 
        profileImage: [],
        linkedInUrl: data.studentData.linkedInUrl || "",
        instagramUrl: data.studentData.instagramUrl || "",
      },
      applicationData: {
        currentAddress: {
          streetAddress: data.applicationData.address,
          city: data.applicationData.city,
          state: "", 
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
      setSaveLoading(true);
    
      const response = await submitApplication(apiPayload);   
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

    } catch (error) {
      console.error("Error saving application:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
      console.log("save",fetchedStudentData?.applicationDetails, isSaved);
      await submitData(data);
  };
  
  const handleRetry = () => {
    setFailedDialogOpen(false); 
    handlePayment();
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-8">
        <div ref={topRef} />
        <div className='flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 mt-10 text-2xl rounded-full'>
          Personal Details
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
            {/* Full Name */}
            <FormField
              control={control}
              name="studentData.firstName"
              render={({ field }) => (
                <FormItem className='flex-1 space-y-1'>
                  <Label className="text-sm font-normal pl-3">Full Name</Label>
                  <FormControl>
                    <Input id="fullName" value={((fetchedStudentData?.firstName || "")+' '+(fetchedStudentData?.lastName || ""))} placeholder="John Doe" disabled/>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
              {/* Email */}
              <FormField
                control={control}
                name="studentData.email"
                render={({ field }) => (
                  <FormItem className='flex-1 space-y-1 relative'>
                    <CheckCircle className="text-[#00CC92] absolute left-3 top-[46px] w-5 h-5 " />
                    <Label className="text-sm font-normal pl-3">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        disabled
                        placeholder="johndoe@gmail.com"
                        className='pl-10'
                        value={fetchedStudentData?.email || ""}
                      />
                    </FormControl>
                    <Mail className="absolute right-3 top-[42px] w-5 h-5 " />
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
              {/* Contact */}
              <FormField
                control={control}
                name="studentData.contact"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    {fetchedStudentData?.isMobileVerified ? 
                      <CheckCircle className="text-[#00CC92] absolute left-3 top-[46px] w-5 h-5 " /> : 
                      <Phone className="absolute left-3 top-[46px] w-5 h-5 " />
                    }
                    <Label className="text-sm font-normal pl-3">Contact No.</Label>
                    <FormControl>
                      <Input disabled={isSaved || fetchedStudentData?.isMobileVerified}
                        id="contact"
                        type="tel"
                        placeholder="+91 95568 97688"
                        className='pl-10'
                        maxLength={13}
                        defaultValue={fetchedStudentData?.mobileNumber || studentData?.mobileNumber || "--"}
                        {...field}
                      />
                    </FormControl>
                    {fetchedStudentData?.isMobileVerified ?
                      <Phone className="absolute right-3 top-[42px] w-5 h-5" /> : 
                      <Button size='sm' className='absolute right-3 top-9 rounded-full px-4 font-normal bg-[#2C2C2C] hover:bg-[#2C2C2C]/80' disabled={otpLoading} onClick={() => handleVerifyClick(field.value || studentData?.mobileNumber)} type="button">
                        {otpLoading ? 'Sending OTP...' : 'VERIFY'}
                      </Button>
                    }
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
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
                    <Label className="text-sm font-normal pl-3">Date of Birth</Label>
                    <FormControl>
                    <input
                      type="date"
                      disabled={isSaved}
                      className="w-full !h-[64px] bg-[#09090B] px-3 uppercase rounded-xl border"
                      id="dob"
                      name="dateOfBirth"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      max={maxDateString}
                    />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}}
              />
              {/* Currently a */}
              <FormField
                control={control}
                name="studentData.currentStatus"
                render={({ field }) => (
                  <FormItem className='flex-1 flex flex-col space-y-1 relative'>
                    <Label className="text-sm font-normal pl-3">You are Currently a</Label>
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
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
            </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Course of Interest */}
            <FormField
              control={control}
              name="studentData.courseOfInterest"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label className="text-sm font-normal pl-3">
                    Course of Interest
                  </Label>
                  <FormControl>
                    <Select
                      disabled={isSaved}
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key={fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?._id} value={fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?._id}>
                          {fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?.name}
                        </SelectItem>
                        {availablePrograms
                        .filter(programId => 
                          programId !== fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId?.programDetail?._id
                        )
                        .map(programId => (
                          <SelectItem key={programId} value={programId}>
                            {getProgramName(programId)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />

            {/* Select Cohort */}
            <FormField
              control={control}
              name="studentData.cohort"
              render={({ field }) => (
              <FormItem className="flex-1 space-y-1">
                <Label className="text-sm font-normal pl-3">
                  Select Cohort
                </Label>
                <FormControl>
                  <Select
                    disabled={isSaved}
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId._id} value={fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId._id}>
                        {formatDateToMonthYear(fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId.startDate)} ({fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId.timeSlot}),{" "}
                        {getCenterName(fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId.centerDetail)}
                      </SelectItem>
                      {filteredCohorts
                      .filter(cohort => cohort._id !== fetchedStudentData?.appliedCohorts?.[fetchedStudentData?.appliedCohorts.length - 1]?.cohortId._id)
                      .map(cohort => (
                        <SelectItem key={cohort._id} value={cohort._id}>
                          {formatDateToMonthYear(cohort.startDate)} ({cohort.timeSlot}), {getCenterName(cohort.centerDetail)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
              )}
            />
          </div>
        </div>
          
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          {/* LinkedIn ID */}
          <FormField
            control={control}
            name="studentData.linkedInUrl"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Your LinkedIn Profile Link (Not Compulsory)</Label>
                <FormControl>
                  <Input className='pr-12' id="linkedInUrl" placeholder="https://www.linkedin.com/JohnDoe" {...field} 
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\s/g, "");
                    field.onChange(newValue);
                  }} disabled={isSaved}/>
                </FormControl>
                <Linkedin className="absolute right-3 top-[42px] w-5 h-5" />
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
            )}
          />
          {/* Instagram ID */}
          <FormField
            control={control}
            name="studentData.instagramUrl"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Your Instagram ID (Not Compulsory)</Label>
                <FormControl>
                  <Input className='pr-12' id="instagramUrl" placeholder="@john_doe" {...field} 
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/\s/g, "");
                    field.onChange(newValue);
                  }} disabled={isSaved}/>
                </FormControl>
                <Instagram className="absolute right-3 top-[42px] w-5 h-5" />
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
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
              <Label className="text-sm font-normal">Select Your Gender</Label>
              <FormControl>
                <RadioGroup disabled={isSaved}
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-6 mt-2"
                >
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
              </FormControl>
              <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
            </FormItem>
          )}
        />

        {/* Current Address */}
        <FormField
          control={control}
          name="applicationData.address"
          render={({ field }) => (
            <FormItem className='flex-1 space-y-1'>
              <Label htmlFor="address" className="text-sm font-normal pl-3">Your Current Address</Label>
              <FormControl>
                <Input id="address" placeholder="Street Address" {...field} disabled={isSaved} />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
            </FormItem>
          )}
        />

        {/* City and Zip Code */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          {/* City */}
          <FormField
            control={control}
            name="applicationData.city"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="city" className="text-sm font-normal pl-3">City, State</Label>
                <FormControl>
                  <Input id="city" placeholder="City, State" {...field} disabled={isSaved} />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
            )}
          />
          {/* Zip Code */}
          <FormField
            control={control}
            name="applicationData.zipcode"
            render={({ field }) => (
              <FormItem className='flex-1 space-y-1'>
                <Label htmlFor="zipcode" className="text-sm font-normal pl-3">Postal/Zip Code</Label>
                <FormControl>
                  <Input maxLength={6} id="zipcode" placeholder="Postal/Zip Code" {...field} 
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, '');
                    field.onChange(target.value);
                  }} disabled={isSaved}/>
                </FormControl>
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
            )}
          />
        </div>

        {/* Previous Education */}
        <div className='flex-1 bg-[#FF791F]/[0.2] text-[#FF791F] text-center py-4 mt-10 text-2xl rounded-full'>
          Previous Education
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Education Level */}
            <FormField
              control={control}
              name="applicationData.educationLevel"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="educationLevel" className="text-sm font-normal pl-3">Highest Level of Education Attained</Label>
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
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Field of Study */}
            <FormField
              control={control}
              name="applicationData.fieldOfStudy"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="fieldOfStudy" className="text-sm font-normal pl-3">Field of Study (Your Major)</Label>
                  <FormControl>
                    <Input id="fieldOfStudy" placeholder="Type here" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          {/* Institution Name and Graduation Year */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Institution Name */}
            <FormField
              control={control}
              name="applicationData.institutionName"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col space-y-1 relative">
                  <Label htmlFor="institutionName" className="text-sm font-normal pl-3">Name of Institution</Label>
                  <FormControl>
                    <Input id="institutionName" placeholder="Type here" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Graduation Year */}
            <FormField
              control={control}
              name="applicationData.graduationYear"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col space-y-1">
                  <Label htmlFor="graduationYear" className="text-sm font-normal pl-3">Year of Graduation</Label>
                  <FormControl>
                    <input 
                      placeholder="MM YYYY"
                      type="month"
                      className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                      id="graduationYear" {...field}
                      max={new Date().toISOString().slice(0, 7)}
                      disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
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
                  <Label className="text-sm font-normal">Do you have any work experience?</Label>
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
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </div>
              </FormItem>
            )}
          />

          {/* Conditional Work Experience Section */}
          {watchHasWorkExperience && (
            <>
              {/* Experience Type and Job Description */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                {/* Experience Type */}
                <FormField
                  control={control}
                  name="applicationData.experienceType"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="experienceType" className="text-sm font-normal pl-3">Select Your Latest Work Experience Type</Label>
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
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                {/* Job Description */}
                <FormField
                  control={control}
                  name="applicationData.jobDescription"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="jobDescription" className="text-sm font-normal pl-3">Latest Job/Service Description</Label>
                      <FormControl>
                        <Input id="jobDescription" placeholder="Type here" {...field} disabled={isSaved} />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields Based on Experience Type */}
              {watchExperienceType === 'Working Professional' && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                  {/* Company Name */}
                  <FormField
                    control={control}
                    name="applicationData.nameOfCompany"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <Label htmlFor="companyName" className="text-sm font-normal pl-3">Name of Company (Latest or Current)</Label>
                        <FormControl>
                          <Input id="companyName" placeholder="Type here" {...field} disabled={isSaved} />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                      </FormItem>
                    )}
                  />
                  {/* Work Duration */}
                  <div className='flex-1 space-y-1'>
                  <Label htmlFor="duration" className="text-sm font-normal pl-3">Apx. Duration of Work</Label>
                    <div className="grid sm:flex flex-1 items-center gap-4 sm:gap-2">
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
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                            {errors.applicationData?.durationFrom && (
                              <span className="text-red-500 text-sm">{errors.applicationData.durationFrom.message}</span>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Minus className='w-4 h-4 mx-auto'/>

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
                              min={watch("applicationData.durationFrom") || undefined}
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
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
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                  {/* Company Name */}
                  <FormField
                    control={control}
                    name="applicationData.nameOfCompany"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <Label htmlFor="companyName" className="text-sm font-normal pl-3">Name of Company</Label>
                        <FormControl>
                          <Input id="companyName" placeholder="Type here" {...field} disabled={isSaved} />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                      </FormItem>
                    )}
                  />
                  {/* Company Start Date */}
                  <FormField
                    control={control}
                    name="applicationData.duration"
                    render={({ field }) => (
                      <FormItem className="flex-1 flex flex-col">
                        <Label htmlFor="companyStartDate" className="text-sm font-normal pl-3">When Did You Start Your Company?</Label>
                        <FormControl>
                          <input 
                            placeholder="MM/YYYY" 
                            type="month"
                            className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                            id="companyStartDate" {...field} 
                            max={new Date().toISOString().slice(0, 7)}
                            disabled={isSaved} />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchExperienceType === 'Freelancer' && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                  {/* Duration of Work */}
                  <div className='flex-1 space-y-1'>
                  <Label htmlFor="duration" className="text-sm font-normal pl-3">Apx. Duration of Work</Label>
                    <div className="grid sm:flex flex-1 items-start gap-2">
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
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                            {errors.applicationData?.durationFrom && (
                              <span className="text-red-500">{errors.applicationData.durationFrom.message}</span>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Minus className='w-4 h-16 mx-auto'/>

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
                              min={watch("applicationData.durationFrom") || undefined}
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
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
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                  <FormField
                    control={control}
                    name="applicationData.nameOfCompany"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        <Label htmlFor="companyName" className="text-sm font-normal pl-3">Name of Company (Latest or Current)</Label>
                        <FormControl>
                          <Input id="companyName" placeholder="Type here" {...field} disabled={isSaved} />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                      </FormItem>
                    )}
                  />
                  {/* Duration of Work */}
                  <div className='flex-1 space-y-1'>
                  <Label htmlFor="duration" className="text-sm font-normal pl-3">Apx. Duration of Work</Label>
                    <div className="grid sm:flex flex-1 items-center gap-2">
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
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                            {errors.applicationData?.durationFrom && (
                              <span className="text-red-500">{errors.applicationData.durationFrom.message}</span>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <Minus className='w-4 h-4 mx-auto'/>

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
                              min={watch("applicationData.durationFrom") || undefined}
                              max={new Date().toISOString().slice(0, 7)}
                              className="w-full !h-[64px] bg-[#09090B] px-3 rounded-xl border text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3">
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
        </div>

        {/* Emergency Contact Details */}
        <div className='flex-1 bg-[#00AB7B]/[0.2] text-[#00AB7B] text-center py-4 mt-10 text-2xl rounded-full'>
          Emergency Contact Details
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Emergency Contact First Name */}
            <FormField
              control={control}
              name="applicationData.emergencyFirstName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="emergencyFirstName" className="text-sm font-normal pl-3">First Name</Label>
                  <FormControl>
                    <Input id="emergencyFirstName" placeholder="Mary" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Emergency Contact Last Name */}
            <FormField
              control={control}
              name="applicationData.emergencyLastName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="emergencyLastName" className="text-sm font-normal pl-3">Last Name</Label>
                  <FormControl>
                    <Input id="emergencyLastName" placeholder="Smith" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Emergency Contact Number */}
            <FormField
              control={control}
              name="applicationData.emergencyContact"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label htmlFor="emergencyContact" className="text-sm font-normal pl-3">Contact No.</Label>
                    <div className="absolute left-3 top-[40.5px]">+91</div>
                  <FormControl>
                    <Input id="emergencyContact" type='tel' className='px-10' placeholder="00000 00000" {...field} maxLength={10}
                      value={field.value}
                      onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                      field.onChange(target.value);
                    }} disabled={isSaved}/>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Relationship */}
            <FormField
              control={control}
              name="applicationData.relationship"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="relationship" className="text-sm font-normal pl-3">Relationship with Contact</Label>
                  <FormControl>
                    <Input id="relationship" placeholder="Father/Mother/Sibling" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Parental Information */}
        <div className='flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 mt-10 text-2xl rounded-full'>
          Parental Information
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Father's First Name */}
            <FormField
              control={control}
              name="applicationData.fatherFirstName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="fatherFirstName" className="text-sm font-normal pl-3">Father's First Name</Label>
                  <FormControl>
                    <Input id="fatherFirstName" placeholder="Richard" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Father's Last Name */}
            <FormField
              control={control}
              name="applicationData.fatherLastName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="fatherLastName" className="text-sm font-normal pl-3">Father's Last Name</Label>
                  <FormControl>
                    <Input id="fatherLastName" placeholder="Doe" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Father's Contact Number */}
            <FormField
              control={control}
              name="applicationData.fatherContact"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label htmlFor="fatherContact" className="text-sm font-normal pl-3">Father's Contact No.</Label>
                  <div className="absolute left-3 top-[40.5px]">+91</div>
                  <FormControl>
                    <Input id="fatherContact" type='tel' className='px-10' placeholder="00000 00000" {...field} maxLength={10}
                    value={field.value}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                      field.onChange(target.value);
                    }} disabled={isSaved}/>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Father's Occupation */}
            <FormField
              control={control}
              name="applicationData.fatherOccupation"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="fatherOccupation" className="text-sm font-normal pl-3">Father's Occupation</Label>
                  <FormControl>
                    <Input id="fatherOccupation" placeholder="Type here" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Mother's Last Name */}
            <FormField
              control={control}
              name="applicationData.fatherEmail"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="fatherEmail" className="text-sm font-normal pl-3">Father's Email</Label>
                  <FormControl>
                    <Input id="fatherEmail" placeholder="richard@gmail.com" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="applicationData.motherFirstName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="motherFirstName" className="text-sm font-normal pl-3">Mother's First Name</Label>
                  <FormControl>
                    <Input id="motherFirstName" placeholder="Jane" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Mother's Last Name */}
            <FormField
              control={control}
              name="applicationData.motherLastName"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="motherLastName" className="text-sm font-normal pl-3">Mother's Last Name</Label>
                  <FormControl>
                    <Input id="motherLastName" placeholder="Doe" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Mother's Contact Number */}
            <FormField
              control={control}
              name="applicationData.motherContact"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 relative">
                  <Label htmlFor="motherContact" className="text-sm font-normal pl-3">Mother's Contact No.</Label>
                  <div className="absolute left-3 top-[40.5px]">+91</div>
                  <FormControl>
                    <Input id="motherContact" type='tel' className='px-10' placeholder="00000 00000" {...field} maxLength={10}
                    value={field.value}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                      field.onChange(target.value);
                    }} disabled={isSaved}/>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
            {/* Mother's Occupation */}
            <FormField
              control={control}
              name="applicationData.motherOccupation"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="motherOccupation" className="text-sm font-normal pl-3">Mother's Occupation</Label>
                  <FormControl>
                    <Input id="motherOccupation" placeholder="Type here" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
            {/* Mother's First Name */}
            <FormField
              control={control}
              name="applicationData.motherEmail"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="motherEmail" className="text-sm font-normal pl-3">Mother's Email</Label>
                  <FormControl>
                    <Input id="motherEmail" placeholder="jane@gmail.com" {...field} disabled={isSaved} />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          {/* Financially Dependent */}
          <FormField
            control={control}
            name="applicationData.financiallyDependent"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-4 sm:p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-sm font-normal">Are you financially dependent on your Parents?</Label>
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
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
            )}
          />
          {/* Applied for Financial Aid */}
          <FormField
            control={control}
            name="applicationData.appliedForFinancialAid"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 p-4 sm:p-6 bg-[#27272A]/[0.6] rounded-2xl">
                <Label className="text-sm font-normal">Have you tried applying for financial aid earlier?</Label>
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
                <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
              </FormItem>
            )}
          />
        </div>
 
        <div className={`flex flex-col sm:flex-row ${isSaved ? 'justify-end' : 'justify-between'} items-center mt-10 space-y-4 sm:space-y-0 sm:space-x-4`}>
  
          {/* Submit/Payment Button */}
          {isPaymentDone ? (
            <Button size="xl" className='w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2'
              type="button" onClick={() => handleContinueToDashboard()} disabled={loading}>
              {loading ? 'Redirecting...' : 'Continue to Dashboard'}
            </Button>
          ) : (
            isSaved ? (
              <Button size="xl" className='w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2'
                type="button" onClick={() => handlePayment()} disabled={loading}>
                {loading ? 'Initializing Payment...' : `Pay INR ₹${applicationFees || 0}.00`}`
              </Button>
            ) : (
              <Button size="xl" className='w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2'
                type="submit" disabled={loading}>
                <div className='flex items-center gap-2'>
                  <SaveIcon className='w-5 h-5' />
                  {loading ? 'Submitting...' : `Submit and Pay INR ₹${applicationFees || 0}.00`}
                </div>
              </Button>
            )
          )}

          {/* "Clear Form" Button */}
          {!isSaved && (
            <Button variant="link" type='button' className='underline w-full sm:w-auto order-2 sm:order-1'
              onClick={() => { form.reset(); localStorage.removeItem(`applicationDetailsForm-${studentData?.email}`); }}          >
              Clear Form
            </Button>
          )}
        </div>
        {!isTopVisible && !isBottomVisible && (
          <Button 
            size="xl" 
            variant="outline" 
            className='fixed bottom-24 right-44 bg-[#09090b] hover:bg-[#09090b]/80'
            type="button" 
            disabled={saveLoading || saved} 
            onClick={() => saveData(form.getValues())}
          >
            <div className='flex items-center gap-2'>
              {saved ? <ClipboardCheck className='w-4 h-4' /> : <Clipboard className='h-4 w-4'/>}
              {saved ? 'Updates Saved' : 'Save Updates'}
            </div>
          </Button>
        )}
        <div ref={bottomRef} />
      </form>
    </Form>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogTitle></DialogTitle>
      <DialogContent className='flex flex-col bg-[#1C1C1C] gap-6 sm:gap rounded-3xl max-w-2xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto max-w-[90vw] sm:max-w-2xl lg:max-w-4xl mx-auto !p-0'>
        <VerifyOTP
          verificationType="contact" 
          contactInfo={contactInfo}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
          setIsDialogOpen={setIsDialogOpen}
          verificationId={verificationId}
          onResendOtp={handleVerifyClick}
        />
      </DialogContent>
    </Dialog>
    <Dialog open={isPaymentDialogOpen}>
    <DialogTitle></DialogTitle>
    <DialogContent className="max-w-2xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto max-w-[90vw] sm:max-w-[500px] mx-auto bg-[#1C1C1C] text-white rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
      <img src='/assets/images/make-payment.svg' className="mx-auto mb-8" />
      <div>
        <div className="text-2xl font-semibold ">Admission Fee Payment</div>
        <div className="mt-2 text-xs sm:text-sm font-normal text-center">
          Make an admission fee payment of INR ₹{applicationFees || 0}.00 to move to the next step of your admission process
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
    <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail={studentData?.email || 'your email'} fee={applicationFees || 0} onContinue={handleContinueToDashboard}/>
    <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleRetry} amount={applicationFees}/>
    <div id='recaptcha-container'>

    </div>
    </>
  );
};

export default ApplicationDetailsForm;