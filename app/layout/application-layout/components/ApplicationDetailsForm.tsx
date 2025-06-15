/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { auth } from "firebase.config";
import { RecaptchaVerifier } from "firebase/auth";
import {
  CheckCircle,
  Clipboard,
  ClipboardCheck,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  Minus,
  Phone,
  SaveIcon,
} from "lucide-react";
import type React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getCentres,
  getCohorts,
  getCurrentStudent,
  getPrograms,
  payApplicationFee,
  submitApplication,
  verifyApplicationFeePayment,
} from "~/api/studentAPI";
import {
  PaymentFailedDialog,
  PaymentSuccessDialog,
} from "~/components/molecules/PaymentDialog/PaymentDialog";
import AverageDurationSelector from "~/components/ui/average-duration-selector";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import DobSelector from "~/components/ui/dob-selector";
import DurationSelector from "~/components/ui/duration-selector";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import GraduationSelector from "~/components/ui/graduation-selector";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { UserContext } from "~/context/UserContext";
import { useFirebaseAuth } from "~/hooks/use-firebase-auth";
import { VerifyOTP } from "~/layout/auth-layout/components/VerifyOTP";

type ExperienceType =
  | "Working Professional"
  | "Business Owner"
  | "Freelancer"
  | "Consultant";

const saveSchema = z.object({
  studentData: z.object({
    email: z.string().nonempty("Email is required"),
    cohort: z.string().nonempty("Cohort is required"),
    linkedInUrl: z
      .string()
      .refine(
        (url) => !url || /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(url),
        {
          message: "Please enter a valid LinkedIn URL.",
        }
      ),
  }),
  applicationData: z.object({
    emergencyContact: z
      .string()
      .refine((val) => val.length === 0 || val.length >= 10, {
        message: "Emergency contact must be at least 10 digits if provided.",
      }),
    fatherEmail: z
      .union([z.string().email("Invalid email address"), z.literal("")])
      .optional(),
    motherEmail: z
      .union([z.string().email("Invalid email address"), z.literal("")])
      .optional(),
  }),
});

const formSchema = z
  .object({
    studentData: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().nonempty("Email is required"),
      contact: z.string().nonempty("Contact number is required"),
      dob: z.string().nonempty("Date of birth is required"),
      currentStatus: z.string().nonempty("Qualification is required"),
      courseOfInterest: z.string().nonempty("Course of interest is required"),
      cohort: z.string().nonempty("Cohort is required"),
      isMobileVerified: z.boolean().optional(),
      linkedInUrl: z.string().optional(),
      instagramUrl: z.string().optional(),
      gender: z.enum(["male", "female", "other"]),
    }),
    profileUrl: z.any().optional(),
    applicationData: z.object({
      address: z.string().nonempty("Address is required"),
      city: z.string().nonempty("City is required"),
      state: z.string().nonempty("State is required"),
      zipcode: z.string().nonempty("Postal/Zip Code is required"),
      educationLevel: z.string().nonempty("Education level is required"),
      fieldOfStudy: z.string().nonempty("Field of study is required"),
      institutionName: z.string().nonempty("Institution name is required"),
      graduationYear: z.string().nonempty("Graduation year is required"),
      isExperienced: z.boolean(),
      experienceType: z
        .enum([
          "",
          "Working Professional",
          "Business Owner",
          "Freelancer",
          "Consultant",
        ])
        .optional(),
      nameOfCompany: z.string().optional(),
      duration: z.string().optional(),
      durationFrom: z.string().optional(),
      durationTo: z.string().optional(),
      jobDescription: z.string().optional(),
      emergencyFirstName: z
        .string()
        .nonempty("Emergency contact's first name is required"),
      emergencyLastName: z
        .string()
        .nonempty("Emergency contact's last name is required"),
      emergencyContact: z
        .string()
        .min(10, "Emergency contact number is required"),
      relationship: z.string().nonempty("Relationship is required"),
      fatherFirstName: z.string().optional(),
      fatherLastName: z.string().optional(),
      fatherContact: z.string().optional(),
      fatherOccupation: z.string().optional(),
      fatherEmail: z
        .union([z.string().email("Invalid email address"), z.literal("")])
        .optional(),
      motherFirstName: z.string().optional(),
      motherLastName: z.string().optional(),
      motherContact: z.string().optional(),
      motherOccupation: z.string().optional(),
      motherEmail: z
        .union([z.string().email("Invalid email address"), z.literal("")])
        .optional(),
      appliedForFinancialAid: z.boolean(),
      loanApplicant: z.enum(["", "father", "mother", "sibling"]).optional(),
      loanType: z
        .enum([
          "",
          "home",
          "gold",
          "vehicle",
          "personal",
          "short-term business",
          "education",
          "other",
        ])
        .optional(),
      requestedLoanAmount: z.number().optional(),
      cibilScore: z.number().optional(),
      annualFamilyIncome: z
        .enum([
          "",
          "below5L",
          "5-10L",
          "10-25L",
          "25-50L",
          "50-75L",
          "75-100L",
          "above1Cr",
        ])
        .optional(),
    }),
  })
  .refine((data) => data.studentData.isMobileVerified, {
    message: "Mobile number needs to be verified.",
    path: ["studentData.contact"],
  })
  .refine(
    (data) => {
      const url = data.studentData.linkedInUrl;
      if (!url) return true;
      return (
        typeof url === "string" &&
        /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(url)
      );
    },
    {
      message: "Please enter a valid LinkedIn URL.",
      path: ["studentData.linkedInUrl"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.isExperienced ||
      data.applicationData.experienceType,
    {
      message: "Experience Type is required.",
      path: ["applicationData.experienceType"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.isExperienced ||
      data.applicationData.jobDescription,
    {
      message: "Job Description is required.",
      path: ["applicationData.jobDescription"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.isExperienced ||
      !["Working Professional", "Business Owner", "Consultant"].includes(
        data.applicationData.experienceType || ""
      ) ||
      data.applicationData.nameOfCompany,
    {
      message: "Company name is required.",
      path: ["applicationData.nameOfCompany"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.isExperienced ||
      !["Business Owner"].includes(data.applicationData.experienceType || "") ||
      data.applicationData.duration,
    {
      message: "Duration is required.",
      path: ["applicationData.duration"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.isExperienced ||
      !["Working Professional", "Freelancer", "Consultant"].includes(
        data.applicationData.experienceType || ""
      ) ||
      data.applicationData.duration,
    {
      message: "Duration is required.",
      path: ["applicationData.durationFrom"],
    }
  )
  .refine(
    (data) =>
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
  )
  .refine(
    (data) =>
      data.applicationData.emergencyContact !== data.studentData.contact,
    {
      message: "Emergency contact and your contact must be different.",
      path: ["applicationData.emergencyContact"],
    }
  )
  .refine(
    (data) => data.applicationData.fatherContact !== data.studentData.contact,
    {
      message: "Father's contact and your contact must be different.",
      path: ["applicationData.fatherContact"],
    }
  )
  .refine(
    (data) => data.applicationData.motherContact !== data.studentData.contact,
    {
      message: "Mother's contact and your contact must be different.",
      path: ["applicationData.motherContact"],
    }
  )
  .refine(
    (data) =>
      data.applicationData.fatherContact !==
        data.applicationData.motherContact ||
      !data.applicationData.fatherContact,
    {
      message: "Father's contact and mother's contact must be different.",
      path: ["applicationData.motherContact"],
    }
  )
  .refine(
    (data) => data.applicationData.fatherEmail !== data.studentData.email,
    {
      message: "Father's email and your email must be different.",
      path: ["applicationData.fatherEmail"],
    }
  )
  .refine(
    (data) => data.studentData.email !== data.applicationData.motherEmail,
    {
      message: "Mother's email and your email must be different.",
      path: ["applicationData.motherEmail"],
    }
  )
  .refine(
    (data) =>
      data.applicationData.fatherEmail !== data.applicationData.motherEmail ||
      !data.applicationData.fatherEmail,
    {
      message: "Father's email and mother's email must be different.",
      path: ["applicationData.motherEmail"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      data.applicationData.loanApplicant,
    {
      message: "Loan Applicant is required.",
      path: ["applicationData.loanApplicant"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      data.applicationData.loanType,
    {
      message: "Type of loan is required.",
      path: ["applicationData.loanType"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      data.applicationData.requestedLoanAmount,
    {
      message: "Loan amount is required.",
      path: ["applicationData.requestedLoanAmount"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      data.applicationData.cibilScore,
    {
      message: "CIBIL Score is required.",
      path: ["applicationData.cibilScore"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      (data.applicationData.cibilScore !== undefined &&
        data.applicationData.cibilScore >= 300 &&
        data.applicationData.cibilScore <= 900),
    {
      message: "CIBIL Score must be between 300 and 900.",
      path: ["applicationData", "cibilScore"],
    }
  )
  .refine(
    (data) =>
      !data.applicationData.appliedForFinancialAid ||
      data.applicationData.annualFamilyIncome,
    {
      message: "Annual Family Income is required.",
      path: ["applicationData.annualFamilyIncome"],
    }
  );

type FormData = z.infer<typeof formSchema>;

const ApplicationDetailsForm: React.FC = () => {
  const { studentData, setStudentData } = useContext(UserContext);
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(
    null
  );
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean | null>(
    null
  );
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [fetchedStudentData, setFetchedStudentData] = useState<any>(null);
  const [applicationFees, setApplicationFees] = useState(0);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTopVisible, setIsTopVisible] = useState(true);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  const navigate = useNavigate();

  const [programs, setPrograms] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [openCohorts, setOpenCohorts] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { initializeRecaptcha, sendOTP, isReady } = useFirebaseAuth();

  const today = new Date();
  const maxGraduationDate = today.toISOString().split("T")[0];
  const minGraduationDate = new Date(
    today.getFullYear() - 50,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setValue,
    watch,
  } = form;

  // Watch zipcode for location lookup
  const zipcode = watch("applicationData.zipcode");

  // Watch state for display
  const stateValue = watch("applicationData.state");

  // Watch the course of interest field
  const selectedProgram = watch("studentData.courseOfInterest");

  // Fetch city/state based on zipcode
  useEffect(() => {
    const fetchCityState = async () => {
      if (zipcode && zipcode.length === 6) {
        setIsFetchingLocation(true);
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${zipcode}`
          );
          const data = await response.json();

          if (
            data[0]?.Status === "Success" &&
            data[0]?.PostOffice?.length > 0
          ) {
            const firstPostOffice = data[0].PostOffice[0];

            // Set city and state separately
            setValue("applicationData.city", firstPostOffice.District, {
              shouldValidate: true,
            });
            setValue("applicationData.state", firstPostOffice.State, {
              shouldValidate: true,
            });
            clearErrors("applicationData.zipcode");
          } else {
            setValue("applicationData.city", "", {
              shouldValidate: true,
            });
            setValue("applicationData.state", "", {
              shouldValidate: true,
            });
            form.setError("applicationData.zipcode", {
              type: "manual",
              message: "Invalid ZIP Code. Please enter a valid ZIP Code.",
            });
          }
        } catch (error) {
          console.error("Failed to fetch city/state", error);
        } finally {
          setIsFetchingLocation(false);
        }
      }
    };

    const handler = setTimeout(fetchCityState, 500);
    return () => clearTimeout(handler);
  }, [zipcode, setValue]);

  // FIXED: Memoized cohort filtering function to prevent unnecessary re-renders
  const updateFilteredCohorts = useCallback(
    (programId: string) => {
      if (!programId || !openCohorts.length) {
        setFilteredCohorts([]);
        return;
      }

      const matching = openCohorts.filter(
        (cohort) => cohort.programDetail === programId
      );

      console.log(
        "Filtered cohorts for program",
        programId,
        ":",
        matching.length
      );
      setFilteredCohorts(matching);
    },
    [openCohorts]
  );

  // FIXED: Single data fetching effect
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        console.log("Fetching programs, centres, and cohorts...");

        const [programsData, centresData, cohortsData] = await Promise.all([
          getPrograms(),
          getCentres(),
          getCohorts(),
        ]);

        if (!isMounted) return;

        setPrograms(programsData.data);
        setCentres(centresData.data);

        const open = cohortsData.data.filter(
          (cohort: any) => cohort.status === "Open"
        );
        setOpenCohorts(open);

        const uniquePrograms = Array.from(
          new Set(open.map((cohort: any) => cohort.programDetail))
        );
        setAvailablePrograms(uniquePrograms);
        setDataLoaded(true);

        console.log("Data fetched successfully:", {
          programs: programsData.data.length,
          centres: centresData.data.length,
          openCohorts: open.length,
          availablePrograms: uniquePrograms.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // FIXED: Separate effect for cohort filtering with debouncing
  useEffect(() => {
    if (!dataLoaded) return;

    const timeoutId = setTimeout(() => {
      updateFilteredCohorts(selectedProgram || "");
    }, 100); // Small delay to prevent rapid updates

    return () => clearTimeout(timeoutId);
  }, [selectedProgram, dataLoaded, updateFilteredCohorts]);

  // Handle course selection change
  const handleCourseChange = useCallback(
    (value: string) => {
      console.log("Course of interest changed to:", value);

      // Update the course field
      setValue("studentData.courseOfInterest", value, { shouldValidate: true });

      // Clear cohort selection only if it's a different program
      const currentCohort = watch("studentData.cohort");
      if (currentCohort) {
        const currentCohortData = openCohorts.find(
          (c) => c._id === currentCohort
        );
        if (!currentCohortData || currentCohortData.programDetail !== value) {
          setValue("studentData.cohort", "", { shouldValidate: false });
        }
      }
    },
    [setValue, watch, openCohorts]
  );

  useEffect(() => {
    if (!fetchedStudentData) return;

    const topObserver = new IntersectionObserver(
      ([entry]) => setIsTopVisible(entry.isIntersecting),
      {
        threshold: 0.1,
      }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => setIsBottomVisible(entry.isIntersecting),
      {
        threshold: 0.1,
      }
    );

    const topNode = topRef.current;
    const bottomNode = bottomRef.current;

    if (topNode) topObserver.observe(topNode);
    if (bottomNode) bottomObserver.observe(bottomNode);

    return () => {
      if (topNode) topObserver.unobserve(topNode);
      if (bottomNode) bottomObserver.unobserve(bottomNode);
    };
  }, [fetchedStudentData]);

  const currentStatus = form.watch("studentData.currentStatus");

  useEffect(() => {
    if (currentStatus) {
      const isExp = [
        "Working Professional",
        "Freelancer",
        "Business Owner",
        "Consultant",
      ].includes(currentStatus);
      const expType = (
        [
          "Working Professional",
          "Business Owner",
          "Freelancer",
          "Consultant",
        ].includes(currentStatus)
          ? currentStatus
          : ""
      ) as
        | ""
        | "Working Professional"
        | "Business Owner"
        | "Freelancer"
        | "Consultant";

      form.setValue("applicationData.isExperienced", isExp);
      form.setValue("applicationData.experienceType", expType);
    }
  }, [currentStatus, form]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentData._id && dataLoaded) {
        try {
          const student = await getCurrentStudent(studentData._id);
          console.log("Student data fetched:", student);

          if (
            student?.appliedCohorts[student?.appliedCohorts.length - 1]
              ?.status === "enrolled"
          ) {
            navigate("../../dashboard");
          } else if (
            student?.appliedCohorts[student?.appliedCohorts.length - 1]
              ?.status === "reviewing"
          ) {
            navigate("../../application/status");
          } else if (
            student?.appliedCohorts[student?.appliedCohorts.length - 1]
              ?.status === "applied"
          ) {
            navigate("../../application/task");
          } else if (
            student?.appliedCohorts[student?.appliedCohorts.length - 1]
              ?.status === "initiated"
          ) {
            navigate("../../application");
          } else if (
            student?.appliedCohorts[student?.appliedCohorts.length - 1]
              ?.status === "dropped"
          ) {
            navigate("../../application/new-application");
          } else {
            navigate("../../application");
          }

          setFetchedStudentData(student);

          const studentDetail =
            student?.appliedCohorts[student.appliedCohorts.length - 1]
              ?.applicationDetails?.studentDetails;

          if (
            student?.appliedCohorts[student.appliedCohorts.length - 1]
              ?.applicationDetails?.studentDetails !== undefined &&
            student?.appliedCohorts[student.appliedCohorts.length - 1]
              ?.applicationDetails?.applicationStatus !== "incomplete"
          ) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }

          if (
            student?.appliedCohorts[student.appliedCohorts.length - 1]
              ?.applicationDetails?.applicationFee === "paid"
          ) {
            setIsPaymentDone(true);
          }

          const existingDataJSON = localStorage.getItem(
            `applicationDetailsForm-${studentData?.email}`
          );
          let existingData: any = null;
          if (existingDataJSON) {
            existingData = JSON.parse(existingDataJSON);
          }

          setApplicationFees(
            student?.appliedCohorts?.[student?.appliedCohorts.length - 1]
              ?.cohortId?.cohortFeesDetail?.applicationFee
          );

          // Handle existing city/state data (split if needed)
          const existingCity =
            studentDetail?.currentAddress?.city ||
            existingData?.applicationData?.city ||
            "";
          const existingState =
            studentDetail?.currentAddress?.state ||
            existingData?.applicationData?.state ||
            "";

          let cityValue = existingCity;
          let stateValue = existingState;

          // If existing data has combined city/state format
          if (existingCity.includes(",") && !stateValue) {
            const [cityPart, statePart] = existingCity
              .split(",")
              .map((p: any) => p.trim());
            cityValue = cityPart;
            stateValue = statePart;
          }

          const mergedForm = {
            studentData: {
              firstName: student?.firstName || studentData?.firstName || "",
              lastName: student?.lastName || studentData?.lastName || "",
              email: student?.email || studentData?.email || "",
              contact:
                student?.mobileNumber ||
                existingData?.studentData?.contact ||
                studentData?.mobileNumber,
              dob: student?.dateOfBirth
                ? student.dateOfBirth.split("T")[0]
                : existingData?.studentData?.dob
                ? existingData?.studentData?.dob.split("T")[0]
                : "",
              currentStatus:
                existingData?.studentData?.currentStatus ||
                student?.appliedCohorts[student?.appliedCohorts.length - 1]
                  ?.qualification ||
                "",
              courseOfInterest:
                student?.appliedCohorts[student?.appliedCohorts.length - 1]
                  ?.status !== "dropped"
                  ? existingData?.studentData?.courseOfInterest ||
                    student?.appliedCohorts[student?.appliedCohorts.length - 1]
                      ?.cohortId?.programDetail?._id
                  : "",
              cohort:
                student?.appliedCohorts[student?.appliedCohorts.length - 1]
                  ?.status !== "dropped"
                  ? existingData?.studentData?.cohort ||
                    student?.appliedCohorts[student?.appliedCohorts.length - 1]
                      ?.cohortId._id
                  : "",
              isMobileVerified: student?.isMobileVerified || false,
              linkedInUrl:
                student?.linkedInUrl ||
                existingData?.studentData?.linkedInUrl ||
                "",
              instagramUrl:
                student?.instagramUrl ||
                existingData?.studentData?.instagramUrl ||
                "",
              gender:
                student?.gender || existingData?.studentData?.gender || "male",
            },
            applicationData: {
              address:
                studentDetail?.currentAddress?.streetAddress ||
                existingData?.applicationData?.address ||
                "",
              city: cityValue,
              state: stateValue,
              zipcode:
                studentDetail?.currentAddress?.postalCode ||
                existingData?.applicationData?.zipcode ||
                "",
              educationLevel:
                studentDetail?.previousEducation?.highestLevelOfEducation ||
                existingData?.applicationData?.educationLevel ||
                "",
              fieldOfStudy:
                studentDetail?.previousEducation?.fieldOfStudy ||
                existingData?.applicationData?.fieldOfStudy ||
                "",
              institutionName:
                studentDetail?.previousEducation?.nameOfInstitution ||
                existingData?.applicationData?.institutionName ||
                "",
              graduationYear:
                studentDetail?.previousEducation?.yearOfGraduation ||
                existingData?.applicationData?.graduationYear ||
                "",
              isExperienced:
                studentDetail?.workExperience?.isExperienced ||
                existingData?.applicationData?.isExperienced ||
                [
                  "Working Professional",
                  "Freelancer",
                  "Business Owner",
                  "Consultant",
                ].includes(
                  studentData?.appliedCohorts[
                    studentData?.appliedCohorts.length - 1
                  ]?.qualification
                ) ||
                false,
              experienceType:
                studentDetail?.workExperience?.experienceType ||
                existingData?.applicationData?.experienceType ||
                ([
                  "Working Professional",
                  "Business Owner",
                  "Freelancer",
                  "Consultant",
                ].includes(
                  studentData?.appliedCohorts[
                    studentData?.appliedCohorts.length - 1
                  ]?.qualification
                )
                  ? studentData?.appliedCohorts[
                      studentData?.appliedCohorts.length - 1
                    ]?.qualification
                  : ""),
              nameOfCompany:
                studentDetail?.workExperience?.nameOfCompany ||
                existingData?.applicationData?.nameOfCompany ||
                "",
              durationFrom: existingData?.applicationData?.durationFrom || "",
              durationTo: existingData?.applicationData?.durationTo || "",
              duration:
                studentDetail?.workExperience?.duration ||
                existingData?.applicationData?.duration ||
                "",
              jobDescription:
                studentDetail?.workExperience?.jobDescription ||
                existingData?.applicationData?.jobDescription ||
                "",
              emergencyFirstName:
                studentDetail?.emergencyContact?.firstName ||
                existingData?.applicationData?.emergencyFirstName ||
                "",
              emergencyLastName:
                studentDetail?.emergencyContact?.lastName ||
                existingData?.applicationData?.emergencyLastName ||
                "",
              emergencyContact:
                studentDetail?.emergencyContact?.contactNumber ||
                existingData?.applicationData?.emergencyContact ||
                "",
              relationship:
                studentDetail?.emergencyContact?.relationshipWithStudent ||
                existingData?.applicationData?.relationship ||
                "",
              fatherFirstName:
                studentDetail?.parentInformation?.father?.firstName ||
                existingData?.applicationData?.fatherFirstName ||
                "",
              fatherLastName:
                studentDetail?.parentInformation?.father?.lastName ||
                existingData?.applicationData?.fatherLastName ||
                "",
              fatherContact:
                studentDetail?.parentInformation?.father?.contactNumber ||
                existingData?.applicationData?.fatherContact ||
                "",
              fatherOccupation:
                studentDetail?.parentInformation?.father?.occupation ||
                existingData?.applicationData?.fatherOccupation ||
                "",
              fatherEmail:
                studentDetail?.parentInformation?.father?.email ||
                existingData?.applicationData?.fatherEmail ||
                "",
              motherFirstName:
                studentDetail?.parentInformation?.mother?.firstName ||
                existingData?.applicationData?.motherFirstName ||
                "",
              motherLastName:
                studentDetail?.parentInformation?.mother?.lastName ||
                existingData?.applicationData?.motherLastName ||
                "",
              motherContact:
                studentDetail?.parentInformation?.mother?.contactNumber ||
                existingData?.applicationData?.motherContact ||
                "",
              motherOccupation:
                studentDetail?.parentInformation?.mother?.occupation ||
                existingData?.applicationData?.motherOccupation ||
                "",
              motherEmail:
                studentDetail?.parentInformation?.mother?.email ||
                existingData?.applicationData?.motherEmail ||
                "",
              appliedForFinancialAid:
                studentDetail?.financialInformation
                  ?.hasAppliedForFinancialAid ||
                existingData?.applicationData?.appliedForFinancialAid ||
                false,
              loanApplicant:
                studentDetail?.financialInformation?.loanApplicant ||
                existingData?.applicationData?.loanApplicant ||
                "",
              loanType:
                studentDetail?.financialInformation?.loanType ||
                existingData?.applicationData?.loanType ||
                "",
              requestedLoanAmount:
                studentDetail?.financialInformation?.requestedLoanAmount ||
                existingData?.applicationData?.requestedLoanAmount ||
                undefined,
              cibilScore:
                studentDetail?.financialInformation?.cibilScore ||
                existingData?.applicationData?.cibilScore ||
                undefined,
              annualFamilyIncome:
                studentDetail?.financialInformation?.annualFamilyIncome ||
                existingData?.applicationData?.annualFamilyIncome ||
                "",
            },
          };

          reset(mergedForm);
        } catch (error) {
          console.error("Failed to fetch student data:", error);
        }
      }
    };

    fetchStudentData();
  }, [studentData, dataLoaded, reset, navigate]);

  useEffect(() => {
    const storedFormJSON = localStorage.getItem(
      `applicationDetailsForm-${studentData?.email}`
    );
    if (storedFormJSON) {
      try {
        const parsedForm = JSON.parse(storedFormJSON);
        reset(parsedForm);
      } catch (error) {
        console.error("Error parsing form data from Local Storage:", error);
      }
    }
  }, [reset, studentData?.email]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (studentData?.email)
        localStorage.setItem(
          `applicationDetailsForm-${studentData?.email}`,
          JSON.stringify(value)
        );
    });
    return () => subscription.unsubscribe();
  }, [watch, studentData?.email]);

  const watchHasWorkExperience = watch("applicationData.isExperienced");
  const watchExperienceType = watch("applicationData.experienceType");
  const watchFinancialAid = watch("applicationData.appliedForFinancialAid");

  const formatMonthYear = (dateStr: any) => {
    const [year, month] = dateStr.split("-");
    return `${month}/${year}`;
  };

  useEffect(() => {
    const durationFrom = watch("applicationData.durationFrom");
    const durationTo = watch("applicationData.durationTo");

    if (durationFrom && durationTo) {
      const formattedFrom = formatMonthYear(durationFrom);
      const formattedTo = formatMonthYear(durationTo);
      setValue("applicationData.duration", `${formattedFrom} - ${formattedTo}`);
    } else {
      setValue("applicationData.duration", "");
    }
  }, [
    watch("applicationData.durationFrom"),
    watch("applicationData.durationTo"),
    setValue,
  ]);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const handleVerifyClick = async (contact: string) => {
    if (typeof window === "undefined") return;

    setOtpLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const confirmationResult = await sendOTP(contact, "recaptcha-container");

      if (confirmationResult) {
        setVerificationId(confirmationResult.verificationId);
        setContactInfo(contact);
        setIsDialogOpen(true);
      }
    } catch (error: any) {
      console.error("Error verifying number:", error);
      form.setError("studentData.contact", {
        type: "manual",
        message: error.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setOtpLoading(false);
    }
  };

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
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  function formatIndianCurrency(value: string | number | undefined): string {
    if (!value) return "";
    const numStr = value.toString();
    const lastThreeDigits = numStr.slice(-3);
    const otherDigits = numStr.slice(0, -3);
    const formattedOtherDigits = otherDigits.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ","
    );
    return otherDigits
      ? `${formattedOtherDigits},${lastThreeDigits}`
      : lastThreeDigits;
  }

  const handleContinueToDashboard = () => {
    window.location.href = "/application/task";
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

  const handlePayment = async () => {
    try {
      setLoading(true);
      setIsPaymentDialogOpen(false);

      const razorpayLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!razorpayLoaded) {
        setLoading(false);
        return;
      }

      const feePayLoad = {
        studentId: fetchedStudentData._id,
        cohortId:
          fetchedStudentData.appliedCohorts[
            fetchedStudentData.appliedCohorts.length - 1
          ].cohortId._id,
      };
      console.log("Payment payload:", feePayLoad);

      const feeResponse = await payApplicationFee(feePayLoad);
      console.log("Fee payment response:", feeResponse);

      const options = {
        key: "rzp_test_1wAgBK19fS5nhr",
        amount: feeResponse.data.amount,
        currency: feeResponse.data.currency,
        name: "The LIT School",
        description: "Application Fee",
        image: "https://example.com/your_logo",
        order_id: feeResponse.data.orderId,
        handler: async () => {
          try {
            const verifyResponse = await verifyApplicationFeePayment(
              feeResponse.data.orderId
            );
            console.log("Payment verification response:", verifyResponse);

            if (verifyResponse.data.latestStatus === "paid") {
              setIsSaved(true);
              setIsPaymentDone(true);
              setSuccessDialogOpen(true);
            } else {
              setFailedDialogOpen(true);
            }
          } catch (verificationError) {
            console.error("Error verifying payment:", verificationError);
            setFailedDialogOpen(true);
          }
        },
        prefill: {
          name: `${studentData?.firstName} ${studentData?.lastName}`,
          email: studentData?.email,
          contact: studentData?.mobileNumber,
        },
        notes: {
          address: "Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      setLoading(false);
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        setFailedDialogOpen(true);
      });
    } catch (error) {
      console.error("Error during payment:", error);
      setLoading(false);
      setFailedDialogOpen(true);
    }
  };

  const submitData = async (data: FormData, isSubmit?: boolean) => {
    const apiPayload = {
      cohortId: data.studentData?.cohort,
      studentDetailId:
        fetchedStudentData?.appliedCohorts[
          fetchedStudentData?.appliedCohorts.length - 1
        ]?.applicationDetails?.studentDetails?._id,
      studentData: {
        firstName: studentData?.firstName || "",
        lastName: studentData?.lastName || "",
        mobileNumber:
          data.studentData?.contact || studentData?.mobileNumber || "",
        isMobileVerified:
          data.studentData?.isMobileVerified ||
          studentData?.isMobileVerified ||
          false,
        email: studentData?.email || "",
        qualification:
          data.studentData.currentStatus ||
          studentData?.appliedCohorts[studentData?.appliedCohorts.length - 1]
            ?.qualification ||
          "",
        program: data.studentData?.courseOfInterest || "",
        cohort: data.studentData?.cohort || "",
        gender: data.studentData.gender,
        isVerified: studentData?.isVerified || false,
        dateOfBirth: new Date(data.studentData.dob || studentData?.dateOfBirth),
        profileImage: [],
        linkedInUrl: data.studentData.linkedInUrl || "",
        instagramUrl: data.studentData.instagramUrl || "",
      },
      applicationData: {
        currentAddress: {
          streetAddress: data.applicationData.address,
          city: data.applicationData.city,
          state: data.applicationData.state,
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
          experienceType: data.applicationData.experienceType || "",
          nameOfCompany: data.applicationData.nameOfCompany || "",
          duration: data.applicationData.duration || "",
          jobDescription: data.applicationData.jobDescription || "",
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
          hasAppliedForFinancialAid:
            data.applicationData.appliedForFinancialAid,
          loanApplicant: data.applicationData.appliedForFinancialAid
            ? data.applicationData.loanApplicant
            : "",
          loanType: data.applicationData.appliedForFinancialAid
            ? data.applicationData.loanType
            : "",
          requestedLoanAmount: data.applicationData.appliedForFinancialAid
            ? data.applicationData.requestedLoanAmount
            : undefined,
          cibilScore: data.applicationData.appliedForFinancialAid
            ? data.applicationData.cibilScore
            : undefined,
          annualFamilyIncome: data.applicationData.appliedForFinancialAid
            ? data.applicationData.annualFamilyIncome
            : "",
        },
      },
    };

    try {
      if (isSubmit) {
        setLoading(true);
      } else {
        await saveSchema.parseAsync({
          studentData: {
            email: form.getValues("studentData.email"),
            cohort: form.getValues("studentData.cohort"),
            linkedInUrl: form.getValues("studentData.linkedInUrl"),
          },
          applicationData: {
            emergencyContact: form.getValues(
              "applicationData.emergencyContact"
            ),
            fatherEmail: form.getValues("applicationData.fatherEmail"),
            motherEmail: form.getValues("applicationData.motherEmail"),
          },
        });
        setSaveLoading(true);
      }
      form.clearErrors();
      console.log("apiPayload", apiPayload);
      const response = await submitApplication(apiPayload);
      console.log("Form submitted successfully", response);

      if (isSubmit) {
        setIsPaymentDialogOpen(true);
        // setIsSaved(true);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          form.setError(path as any, { message: err.message });
        });
      } else if (isSubmit) setFailedDialogOpen(true);
    } finally {
      if (isSubmit) {
        setLoading(false);
      } else {
        setSaveLoading(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log(
      "Submitting form:",
      fetchedStudentData?.applicationDetails,
      isSaved
    );
    await submitData(data, true);
  };

  const handleRetry = () => {
    setFailedDialogOpen(false);
    handlePayment();
  };

  return (
    <>
      {!fetchedStudentData ? (
        <div className="flex flex-col gap-6 mt-8">
          <Skeleton className="w-full bg-white/10 h-16 rounded-full" />
          <Skeleton className="w-full bg-white/10 h-[200px] " />
          <Skeleton className="w-full bg-white/10 h-16 rounded-full" />
          <Skeleton className="w-full bg-white/10 h-[200px] " />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 mt-8"
          >
            <div ref={topRef} />
            <div className="flex-1 bg-[#00A3FF]/[0.2] text-[#00A3FF] text-center py-4 mt-10 text-2xl rounded-full">
              Personal Details
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              <FormField
                control={control}
                name="studentData.firstName"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label className="text-sm font-normal pl-3">
                      Full Name
                    </Label>
                    <FormControl>
                      <Input
                        id="fullName"
                        value={
                          (fetchedStudentData?.firstName || "") +
                          " " +
                          (fetchedStudentData?.lastName || "")
                        }
                        placeholder="John Doe"
                        disabled
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="studentData.email"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1 relative">
                      <CheckCircle className="text-[#00CC92] absolute left-3 top-[46px] w-5 h-5 " />
                      <Label className="text-sm font-normal pl-3">Email</Label>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          disabled
                          placeholder="johndoe@gmail.com"
                          className="pl-10"
                          value={fetchedStudentData?.email || ""}
                        />
                      </FormControl>
                      <Mail className="absolute right-3 top-[42px] w-5 h-5 " />
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="studentData.contact"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1 relative">
                      {fetchedStudentData?.isMobileVerified ? (
                        <CheckCircle className="text-[#00CC92] absolute left-3 top-[46px] w-5 h-5 " />
                      ) : (
                        <Phone className="absolute left-3 top-[46px] w-5 h-5 " />
                      )}
                      <Label className="text-sm font-normal pl-3">
                        Contact No.
                      </Label>
                      <FormControl>
                        <Input
                          disabled={
                            isSaved || fetchedStudentData?.isMobileVerified
                          }
                          id="contact"
                          type="tel"
                          placeholder="+91 95568 97688"
                          className="pl-10"
                          maxLength={13}
                          defaultValue={
                            fetchedStudentData?.mobileNumber ||
                            studentData?.mobileNumber ||
                            "--"
                          }
                          {...field}
                        />
                      </FormControl>
                      {fetchedStudentData?.isMobileVerified ? (
                        <Phone className="absolute right-3 top-[42px] w-5 h-5" />
                      ) : (
                        <Button
                          size="sm"
                          className="absolute right-3 top-9 rounded-full px-4 font-normal bg-[#2C2C2C] hover:bg-[#2C2C2C]/80"
                          disabled={otpLoading}
                          onClick={() =>
                            handleVerifyClick(
                              field.value || fetchedStudentData?.mobileNumber
                            )
                          }
                          type="button"
                        >
                          {otpLoading ? "Sending OTP..." : "VERIFY"}
                        </Button>
                      )}
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="studentData.dob"
                  render={({ field }) => {
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() - 16);
                    const maxDateString = maxDate.toISOString().split("T")[0];

                    return (
                      <FormItem className="flex-1 flex flex-col space-y-1 relative">
                        <Label className="text-sm font-normal pl-3">
                          Date of Birth
                        </Label>
                        <FormControl>
                          <DobSelector
                            id="dob"
                            name="dateOfBirth"
                            disabled={isSaved}
                            value={field.value || ""}
                            maxDate={maxDateString}
                            onChange={(date) => field.onChange(date)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={control}
                  name="studentData.currentStatus"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1 relative">
                      <Label className="text-sm font-normal pl-3">
                        You are Currently a
                      </Label>
                      <FormControl>
                        <Select
                          disabled={isSaved}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`${
                              field.value
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Highschool Graduate">
                              Highschool Graduate
                            </SelectItem>
                            <SelectItem value="College Graduate">
                              College Graduate
                            </SelectItem>
                            <SelectItem value="Working Professional">
                              Working Professional
                            </SelectItem>
                            <SelectItem value="Freelancer">
                              Freelancer
                            </SelectItem>
                            <SelectItem value="Business Owner">
                              Business Owner
                            </SelectItem>
                            <SelectItem value="Consultant">
                              Consultant
                            </SelectItem>
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
              {/* FIXED: Course of Interest with proper change handling */}
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
                        onValueChange={handleCourseChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`${
                            field.value ? "text-white" : "text-muted-foreground"
                          }`}
                        >
                          <SelectValue placeholder="Select a Program" />
                        </SelectTrigger>
                        <SelectContent>
                          {fetchedStudentData?.appliedCohorts?.[
                            fetchedStudentData?.appliedCohorts.length - 1
                          ]?.cohortId?.programDetail?._id && (
                            <SelectItem
                              key={
                                fetchedStudentData?.appliedCohorts?.[
                                  fetchedStudentData?.appliedCohorts.length - 1
                                ]?.cohortId?.programDetail?._id
                              }
                              value={
                                fetchedStudentData?.appliedCohorts?.[
                                  fetchedStudentData?.appliedCohorts.length - 1
                                ]?.cohortId?.programDetail?._id
                              }
                            >
                              {
                                fetchedStudentData?.appliedCohorts?.[
                                  fetchedStudentData?.appliedCohorts.length - 1
                                ]?.cohortId?.programDetail?.name
                              }
                            </SelectItem>
                          )}
                          {availablePrograms
                            .filter(
                              (programId) =>
                                programId !==
                                fetchedStudentData?.appliedCohorts?.[
                                  fetchedStudentData?.appliedCohorts.length - 1
                                ]?.cohortId?.programDetail?._id
                            )
                            .map((programId) => (
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

              {/* FIXED: Select Cohort with proper filtering */}
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
                        disabled={isSaved || !selectedProgram}
                        onValueChange={(value) => {
                          console.log("Cohort changed to:", value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`${
                            field.value ? "text-white" : "text-muted-foreground"
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !selectedProgram
                                ? "Select a course first"
                                : "Select"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {fetchedStudentData?.appliedCohorts?.[
                            fetchedStudentData?.appliedCohorts.length - 1
                          ]?.cohortId?._id &&
                            fetchedStudentData?.appliedCohorts?.[
                              fetchedStudentData?.appliedCohorts.length - 1
                            ]?.cohortId?.programDetail?._id ===
                              selectedProgram && (
                              <SelectItem
                                key={
                                  fetchedStudentData?.appliedCohorts?.[
                                    fetchedStudentData?.appliedCohorts.length -
                                      1
                                  ]?.cohortId._id
                                }
                                value={
                                  fetchedStudentData?.appliedCohorts?.[
                                    fetchedStudentData?.appliedCohorts.length -
                                      1
                                  ]?.cohortId._id
                                }
                              >
                                {formatDateToMonthYear(
                                  fetchedStudentData?.appliedCohorts?.[
                                    fetchedStudentData?.appliedCohorts.length -
                                      1
                                  ]?.cohortId.startDate
                                )}{" "}
                                (
                                {
                                  fetchedStudentData?.appliedCohorts?.[
                                    fetchedStudentData?.appliedCohorts.length -
                                      1
                                  ]?.cohortId.timeSlot
                                }
                                ),{" "}
                                {getCenterName(
                                  fetchedStudentData?.appliedCohorts?.[
                                    fetchedStudentData?.appliedCohorts.length -
                                      1
                                  ]?.cohortId.centerDetail
                                )}
                              </SelectItem>
                            )}
                          {filteredCohorts
                            .filter(
                              (cohort) =>
                                cohort._id !==
                                fetchedStudentData?.appliedCohorts?.[
                                  fetchedStudentData?.appliedCohorts.length - 1
                                ]?.cohortId?._id
                            )
                            .map((cohort) => (
                              <SelectItem key={cohort._id} value={cohort._id}>
                                {formatDateToMonthYear(cohort.startDate)} (
                                {cohort.timeSlot}),{" "}
                                {getCenterName(cohort.centerDetail)}
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

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
              <FormField
                control={control}
                name="studentData.linkedInUrl"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    <Label className="text-sm font-normal pl-3">
                      Your LinkedIn Profile Link (Optional)
                    </Label>
                    <FormControl>
                      <Input
                        className="pr-12"
                        id="linkedInUrl"
                        placeholder="https://www.linkedin.com/JohnDoe"
                        {...field}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\s/g, "");
                          field.onChange(newValue);
                        }}
                        disabled={isSaved}
                      />
                    </FormControl>
                    <Linkedin className="absolute right-3 top-[42px] w-5 h-5" />
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="studentData.instagramUrl"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1 relative">
                    <Label className="text-sm font-normal pl-3">
                      Your Instagram ID (Optional)
                    </Label>
                    <FormControl>
                      <Input
                        className="pr-12"
                        id="instagramUrl"
                        placeholder="@john_doe"
                        {...field}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/\s/g, "");
                          field.onChange(newValue);
                        }}
                        disabled={isSaved}
                      />
                    </FormControl>
                    <Instagram className="absolute right-3 top-[42px] w-5 h-5" />
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="studentData.gender"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1 pl-3">
                  <Label className="text-sm font-normal">
                    Select Your Gender
                  </Label>
                  <FormControl>
                    <RadioGroup
                      disabled={isSaved}
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="text-base font-normal">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label
                          htmlFor="female"
                          className="text-base font-normal"
                        >
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label
                          htmlFor="other"
                          className="text-base font-normal"
                        >
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="applicationData.address"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <Label htmlFor="address" className="text-sm font-normal pl-3">
                    Your Current Address
                  </Label>
                  <FormControl>
                    <Input
                      id="address"
                      placeholder="Street Address"
                      {...field}
                      disabled={isSaved}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
              <FormField
                control={control}
                name="applicationData.city"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label htmlFor="city" className="text-sm font-normal pl-3">
                      City, State
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="city"
                          placeholder="City"
                          {...field}
                          disabled={isSaved}
                          value={
                            stateValue
                              ? `${field.value}, ${stateValue}`
                              : field.value || ""
                          }
                          onChange={(e) => {
                            // Allow manual editing
                            const value = e.target.value;
                            const [cityPart, statePart] = value
                              .split(",")
                              .map((p) => p.trim());
                            setValue("applicationData.city", cityPart || "");
                            setValue("applicationData.state", statePart || "");
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="applicationData.zipcode"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
                    <Label
                      htmlFor="zipcode"
                      className="text-sm font-normal pl-3"
                    >
                      Postal/Zip Code{" "}
                      {isFetchingLocation && " (Fetching location...)"}
                    </Label>
                    <FormControl>
                      <Input
                        maxLength={6}
                        id="zipcode"
                        placeholder="Postal/Zip Code"
                        {...field}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, "");
                          field.onChange(target.value);
                        }}
                        disabled={isSaved}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
            </div>

            {/* Hidden state field for payload */}
            <FormField
              control={control}
              name="applicationData.state"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex-1 bg-[#FF791F]/[0.2] text-[#FF791F] text-center py-4 mt-10 text-2xl rounded-full">
              Previous Education
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.educationLevel"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="educationLevel"
                        className="text-sm font-normal pl-3"
                      >
                        Highest Level of Education Attained
                      </Label>
                      <FormControl>
                        <Select
                          disabled={isSaved}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={`${
                              field.value
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="highschool">
                              High School
                            </SelectItem>
                            <SelectItem value="bachelor">
                              Bachelor&apos;s Degree
                            </SelectItem>
                            <SelectItem value="master">
                              Master&apos;s Degree
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.fieldOfStudy"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="fieldOfStudy"
                        className="text-sm font-normal pl-3"
                      >
                        Field of Study (Your Major)
                      </Label>
                      <FormControl>
                        <Input
                          id="fieldOfStudy"
                          placeholder="Type here"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.institutionName"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1 relative">
                      <Label
                        htmlFor="institutionName"
                        className="text-sm font-normal pl-3"
                      >
                        Name of Institution
                      </Label>
                      <FormControl>
                        <Input
                          id="institutionName"
                          placeholder="Type here"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.graduationYear"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col space-y-1">
                      <Label
                        htmlFor="graduationYear"
                        className="text-sm font-normal pl-3"
                      >
                        Year of Graduation
                      </Label>
                      <FormControl>
                        <GraduationSelector
                          value={field.value}
                          onChange={field.onChange}
                          maxDate={maxGraduationDate}
                          minDate={minGraduationDate}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="applicationData.isExperienced"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 space-y-1 pl-3">
                      <Label className="text-sm font-normal">
                        Do you have any work experience?
                      </Label>
                      <FormControl>
                        <RadioGroup
                          disabled={isSaved}
                          className="flex space-x-6 mt-2"
                          onValueChange={(value) => {
                            const booleanValue = value === "yes";
                            field.onChange(booleanValue);
                            setHasWorkExperience(booleanValue);
                          }}
                          value={field.value ? "yes" : "no"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="yes"
                              id="yesWorkExperience"
                            />
                            <Label
                              htmlFor="yesWorkExperience"
                              className="text-base font-normal"
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="noWorkExperience" />
                            <Label
                              htmlFor="noWorkExperience"
                              className="text-base font-normal"
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </div>
                  </FormItem>
                )}
              />

              {watchHasWorkExperience && (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                    <FormField
                      control={control}
                      name="applicationData.experienceType"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <Label
                            htmlFor="experienceType"
                            className="text-sm font-normal pl-3"
                          >
                            Select Your Latest Work Experience Type
                          </Label>
                          <FormControl>
                            <Select
                              value={field.value}
                              disabled={isSaved}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setExperienceType(value as ExperienceType);
                              }}
                            >
                              <SelectTrigger
                                className={`${
                                  field.value
                                    ? "text-white"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Working Professional">
                                  Employee
                                </SelectItem>
                                <SelectItem value="Freelancer">
                                  Freelancer
                                </SelectItem>
                                <SelectItem value="Business Owner">
                                  Business Owner
                                </SelectItem>
                                <SelectItem value="Consultant">
                                  Consultant
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="applicationData.jobDescription"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <Label
                            htmlFor="jobDescription"
                            className="text-sm font-normal pl-3"
                          >
                            Latest Job/Service Description
                          </Label>
                          <FormControl>
                            <Input
                              id="jobDescription"
                              placeholder="Type here"
                              {...field}
                              disabled={isSaved}
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchExperienceType === "Working Professional" && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                      <FormField
                        control={control}
                        name="applicationData.nameOfCompany"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-1">
                            <Label
                              htmlFor="companyName"
                              className="text-sm font-normal pl-3"
                            >
                              Name of Company (Latest or Current)
                            </Label>
                            <FormControl>
                              <Input
                                id="companyName"
                                placeholder="Type here"
                                {...field}
                                disabled={isSaved}
                              />
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                          </FormItem>
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="duration"
                          className="text-sm font-normal pl-3"
                        >
                          Apx. Duration of Work
                        </Label>
                        <div className="grid sm:flex flex-1 items-center gap-4 sm:gap-2">
                          <FormField
                            control={control}
                            name="applicationData.durationFrom"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationFrom"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationFrom && (
                                    <span className="text-red-500 text-sm">
                                      {
                                        errors.applicationData.durationFrom
                                          .message
                                      }
                                    </span>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <Minus className="w-4 h-4 mx-auto" />

                          <FormField
                            control={control}
                            name="applicationData.durationTo"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationTo"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationTo && (
                                    <span className="text-red-500">
                                      {
                                        errors.applicationData.durationTo
                                          .message
                                      }
                                    </span>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {watchExperienceType === "Business Owner" && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                      <FormField
                        control={control}
                        name="applicationData.nameOfCompany"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-1">
                            <Label
                              htmlFor="companyName"
                              className="text-sm font-normal pl-3"
                            >
                              Name of Company
                            </Label>
                            <FormControl>
                              <Input
                                id="companyName"
                                placeholder="Type here"
                                {...field}
                                disabled={isSaved}
                              />
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="applicationData.duration"
                        render={({ field }) => (
                          <FormItem className="flex-1 flex flex-col">
                            <Label
                              htmlFor="companyStartDate"
                              className="text-sm font-normal pl-3"
                            >
                              When Did You Start Your Company?
                            </Label>
                            <FormControl>
                              <FormControl>
                                <DurationSelector
                                  id="companyStartDate"
                                  name={field.name}
                                  value={field.value}
                                  onChange={field.onChange}
                                  maxDate={
                                    new Date().toISOString().split("T")[0]
                                  } // YYYY-MM-DD
                                  disabled={isSaved}
                                />
                              </FormControl>
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {watchExperienceType === "Freelancer" && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="duration"
                          className="text-sm font-normal pl-3"
                        >
                          Apx. Duration of Work
                        </Label>
                        <div className="grid sm:flex flex-1 items-center gap-4 sm:gap-2">
                          <FormField
                            control={control}
                            name="applicationData.durationFrom"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationFrom"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationFrom && (
                                    <span className="text-red-500 text-sm">
                                      {
                                        errors.applicationData.durationFrom
                                          .message
                                      }
                                    </span>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <Minus className="w-4 h-4 mx-auto" />

                          <FormField
                            control={control}
                            name="applicationData.durationTo"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationTo"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationTo && (
                                    <span className="text-red-500">
                                      {
                                        errors.applicationData.durationTo
                                          .message
                                      }
                                    </span>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {watchExperienceType === "Consultant" && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                      <FormField
                        control={control}
                        name="applicationData.nameOfCompany"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-1">
                            <Label
                              htmlFor="companyName"
                              className="text-sm font-normal pl-3"
                            >
                              Name of Company (Latest or Current)
                            </Label>
                            <FormControl>
                              <Input
                                id="companyName"
                                placeholder="Type here"
                                {...field}
                                disabled={isSaved}
                              />
                            </FormControl>
                            <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                          </FormItem>
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="duration"
                          className="text-sm font-normal pl-3"
                        >
                          Apx. Duration of Work
                        </Label>
                        <div className="grid sm:flex flex-1 items-center gap-4 sm:gap-2">
                          <FormField
                            control={control}
                            name="applicationData.durationFrom"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationFrom"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationFrom && (
                                    <span className="text-red-500 text-sm">
                                      {
                                        errors.applicationData.durationFrom
                                          .message
                                      }
                                    </span>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />

                          <Minus className="w-4 h-4 mx-auto" />

                          <FormField
                            control={control}
                            name="applicationData.durationTo"
                            render={({ field }) => (
                              <FormItem className="flex-1 flex flex-col space-y-1">
                                <FormControl>
                                  <AverageDurationSelector
                                    id="durationTo"
                                    className="w-full !h-[64px] px-3 rounded-xl"
                                    disabled={isSaved}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm font-normal pl-3">
                                  {errors.applicationData?.durationTo && (
                                    <span className="text-red-500">
                                      {
                                        errors.applicationData.durationTo
                                          .message
                                      }
                                    </span>
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

            <div className="flex-1 bg-[#00AB7B]/[0.2] text-[#00AB7B] text-center py-4 mt-10 text-2xl rounded-full">
              Emergency Contact Details
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.emergencyFirstName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="emergencyFirstName"
                        className="text-sm font-normal pl-3"
                      >
                        First Name
                      </Label>
                      <FormControl>
                        <Input
                          id="emergencyFirstName"
                          placeholder="Mary"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.emergencyLastName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="emergencyLastName"
                        className="text-sm font-normal pl-3"
                      >
                        Last Name
                      </Label>
                      <FormControl>
                        <Input
                          id="emergencyLastName"
                          placeholder="Smith"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.emergencyContact"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1 relative">
                      <Label
                        htmlFor="emergencyContact"
                        className="text-sm font-normal pl-3"
                      >
                        Contact No.
                      </Label>
                      <div className="absolute left-3 top-[40.5px]">+91</div>
                      <FormControl>
                        <Input
                          id="emergencyContact"
                          type="tel"
                          className="px-10"
                          placeholder="00000 00000"
                          {...field}
                          maxLength={10}
                          value={field.value}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, "");
                            field.onChange(target.value);
                          }}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.relationship"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="relationship"
                        className="text-sm font-normal pl-3"
                      >
                        Relationship with Contact
                      </Label>
                      <FormControl>
                        <Input
                          id="relationship"
                          placeholder="Father/Mother/Sibling"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex-1 bg-[#FA69E5]/[0.2] text-[#FA69E5] text-center py-4 mt-10 text-2xl rounded-full">
              Parental Information
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.fatherFirstName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="fatherFirstName"
                        className="text-sm font-normal pl-3"
                      >
                        Father&apos;s First Name
                      </Label>
                      <FormControl>
                        <Input
                          id="fatherFirstName"
                          placeholder="Richard"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.fatherLastName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="fatherLastName"
                        className="text-sm font-normal pl-3"
                      >
                        Father&apos;s Last Name
                      </Label>
                      <FormControl>
                        <Input
                          id="fatherLastName"
                          placeholder="Doe"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.fatherContact"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1 relative">
                      <Label
                        htmlFor="fatherContact"
                        className="text-sm font-normal pl-3"
                      >
                        Father&apos;s Contact No.
                      </Label>
                      <div className="absolute left-3 top-[40.5px]">+91</div>
                      <FormControl>
                        <Input
                          id="fatherContact"
                          type="tel"
                          className="px-10"
                          placeholder="00000 00000"
                          {...field}
                          maxLength={10}
                          value={field.value}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, "");
                            field.onChange(target.value);
                          }}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.fatherOccupation"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="fatherOccupation"
                        className="text-sm font-normal pl-3"
                      >
                        Father&apos;s Occupation
                      </Label>
                      <FormControl>
                        <Input
                          id="fatherOccupation"
                          placeholder="Type here"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.fatherEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="fatherEmail"
                        className="text-sm font-normal pl-3"
                      >
                        Father&apos;s Email
                      </Label>
                      <FormControl>
                        <Input
                          id="fatherEmail"
                          placeholder="richard@gmail.com"
                          {...field}
                          disabled={isSaved}
                        />
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
                      <Label
                        htmlFor="motherFirstName"
                        className="text-sm font-normal pl-3"
                      >
                        Mother&apos;s First Name
                      </Label>
                      <FormControl>
                        <Input
                          id="motherFirstName"
                          placeholder="Jane"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.motherLastName"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="motherLastName"
                        className="text-sm font-normal pl-3"
                      >
                        Mother&apos;s Last Name
                      </Label>
                      <FormControl>
                        <Input
                          id="motherLastName"
                          placeholder="Doe"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.motherContact"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1 relative">
                      <Label
                        htmlFor="motherContact"
                        className="text-sm font-normal pl-3"
                      >
                        Mother&apos;s Contact No.
                      </Label>
                      <div className="absolute left-3 top-[40.5px]">+91</div>
                      <FormControl>
                        <Input
                          id="motherContact"
                          type="tel"
                          className="px-10"
                          placeholder="00000 00000"
                          {...field}
                          maxLength={10}
                          value={field.value}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, "");
                            field.onChange(target.value);
                          }}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                <FormField
                  control={control}
                  name="applicationData.motherOccupation"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="motherOccupation"
                        className="text-sm font-normal pl-3"
                      >
                        Mother&apos;s Occupation
                      </Label>
                      <FormControl>
                        <Input
                          id="motherOccupation"
                          placeholder="Type here"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="applicationData.motherEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-1">
                      <Label
                        htmlFor="motherEmail"
                        className="text-sm font-normal pl-3"
                      >
                        Mother&apos;s Email
                      </Label>
                      <FormControl>
                        <Input
                          id="motherEmail"
                          placeholder="jane@gmail.com"
                          {...field}
                          disabled={isSaved}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
              <FormField
                control={control}
                name="applicationData.appliedForFinancialAid"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 space-y-1 p-4 sm:p-6 bg-[#27272A]/[0.6] rounded-2xl">
                    <Label className="text-sm font-normal">
                      Have you tried applying for financial aid earlier?
                    </Label>
                    <FormControl>
                      <RadioGroup
                        disabled={isSaved}
                        className="flex space-x-6 mt-2"
                        onValueChange={(value) =>
                          field.onChange(value === "yes")
                        }
                        value={field.value ? "yes" : "no"}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yesFinancialAid" />
                          <Label
                            htmlFor="yesFinancialAid"
                            className="text-base font-normal"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="noFinancialAid" />
                          <Label
                            htmlFor="noFinancialAid"
                            className="text-base font-normal"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                  </FormItem>
                )}
              />
              {watchFinancialAid && (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                    <FormField
                      control={control}
                      name="applicationData.loanApplicant"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <Label
                            htmlFor="loanApplicant"
                            className="text-sm font-normal pl-3"
                          >
                            Who Applied For This Loan?
                          </Label>
                          <FormControl>
                            <Select
                              disabled={isSaved}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger
                                className={`${
                                  field.value
                                    ? "text-white"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="applicationData.loanType"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <Label
                            htmlFor="loanType"
                            className="text-sm font-normal pl-3"
                          >
                            Type of Loan
                          </Label>
                          <FormControl>
                            <Select
                              disabled={isSaved}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger
                                className={`${
                                  field.value
                                    ? "text-white"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <SelectValue
                                  placeholder="Select"
                                  className={`${
                                    field.value
                                      ? "text-white"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">Home Loan</SelectItem>
                                <SelectItem value="gold">Gold Loan</SelectItem>
                                <SelectItem value="vehicle">
                                  Vehicle Loan
                                </SelectItem>
                                <SelectItem value="personal">
                                  Personal Loan
                                </SelectItem>
                                <SelectItem value="short-term business">
                                  Short-term Business Loan
                                </SelectItem>
                                <SelectItem value="education">
                                  Education Loan
                                </SelectItem>
                                <SelectItem value="other">other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                    <FormField
                      control={control}
                      name="applicationData.requestedLoanAmount"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1 relative">
                          <Label
                            htmlFor="requestedLoanAmount"
                            className="text-sm font-normal pl-3"
                          >
                            Loan Amount
                          </Label>
                          <div className="absolute left-3 top-[40px]">INR</div>
                          <FormControl>
                            <Input
                              className="pl-11"
                              id="requestedLoanAmount"
                              placeholder="5,00,000"
                              maxLength={12}
                              value={
                                field.value === undefined
                                  ? ""
                                  : formatIndianCurrency(field.value)
                              }
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                // Remove non-numeric characters except decimal point
                                let value = target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                                // Remove multiple decimal points
                                if ((value.match(/\./g) || []).length > 1) {
                                  value = value.slice(0, -1);
                                }
                                // Convert to number
                                const numericValue =
                                  value === "" ? undefined : Number(value);
                                field.onChange(numericValue);
                              }}
                              disabled={isSaved}
                            />
                          </FormControl>

                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="applicationData.cibilScore"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <Label
                            htmlFor="cibilScore"
                            className="text-sm font-normal pl-3"
                          >
                            CIBIL Score of the Borrower
                          </Label>
                          <FormControl>
                            <Input
                              id="cibilScore"
                              placeholder="300 to 900"
                              value={
                                field.value === undefined
                                  ? ""
                                  : field.value.toString()
                              }
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                // Only allow numbers
                                const numericValue = target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                // Convert to number
                                const value =
                                  numericValue === ""
                                    ? undefined
                                    : Number(numericValue);
                                field.onChange(value);
                              }}
                              maxLength={3}
                              minLength={3}
                              disabled={isSaved}
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
                    <FormField
                      control={control}
                      name="applicationData.annualFamilyIncome"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1 relative">
                          <Label
                            htmlFor="annualFamilyIncome"
                            className="text-sm font-normal pl-3"
                          >
                            Combined Family Income Per Annum
                          </Label>
                          <FormControl>
                            <Select
                              disabled={isSaved}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger
                                className={`pl-11 relative ${
                                  field.value
                                    ? "text-white"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                                  INR
                                </span>
                                <SelectValue
                                  placeholder="5,00,000–10,00,000"
                                  className="pl-0"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="below5L">
                                  Below 5L
                                </SelectItem>
                                <SelectItem value="5-10L">5-10L</SelectItem>
                                <SelectItem value="10-25L">10-25L</SelectItem>
                                <SelectItem value="25-50L">25-50L</SelectItem>
                                <SelectItem value="50-75L">50-75L</SelectItem>
                                <SelectItem value="75-100L">75L–1Cr</SelectItem>
                                <SelectItem value="above1Cr">
                                  Above 1 Cr.
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm font-normal pl-3" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

            <div
              className={`flex flex-col sm:flex-row ${
                isSaved ? "justify-end" : "justify-between"
              } items-center mt-10 space-y-4 sm:space-y-0 sm:space-x-4`}
            >
              {isPaymentDone ? (
                <Button
                  size="xl"
                  className="w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2"
                  type="button"
                  onClick={() => handleContinueToDashboard()}
                  disabled={loading}
                >
                  {loading ? "Redirecting..." : "Continue to Dashboard"}
                </Button>
              ) : isSaved ? (
                <Button
                  size="xl"
                  className="w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2"
                  type="button"
                  onClick={() => handlePayment()}
                  disabled={loading}
                >
                  {loading
                    ? "Initializing Payment..."
                    : `Pay INR ${applicationFees || 0}.00`}
                </Button>
              ) : (
                <Button
                  size="xl"
                  className="w-full sm:w-fit px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90 order-1 sm:order-2"
                  type="submit"
                  disabled={loading}
                >
                  <div className="flex items-center gap-2">
                    <SaveIcon className="w-5 h-5" />
                    {loading
                      ? "Submitting..."
                      : `Submit and Pay INR ${applicationFees || 0}.00`}
                  </div>
                </Button>
              )}

              {!isSaved && (
                <Button
                  variant="link"
                  type="button"
                  className="underline w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => {
                    form.reset();
                    localStorage.removeItem(
                      `applicationDetailsForm-${studentData?.email}`
                    );
                  }}
                >
                  Clear Form
                </Button>
              )}
            </div>
            {!isTopVisible && !isBottomVisible && (
              <Button
                size="xl"
                variant="outline"
                className="fixed bottom-24 right-4 sm:right-44 bg-[#09090b] hover:bg-[#09090b]/80"
                type="button"
                disabled={saveLoading || saved}
                onClick={() => submitData(form.getValues())}
              >
                <div className="sm:hidden flex items-center gap-2">
                  {saved ? (
                    <ClipboardCheck className="w-4 h-4" />
                  ) : saveLoading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {saved ? "Saved" : saveLoading ? "Saving" : "Save"}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {saved ? (
                    <ClipboardCheck className="w-4 h-4" />
                  ) : saveLoading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {saved
                    ? "Updates Saved"
                    : saveLoading
                    ? "Saving Updates"
                    : "Save Updates"}
                </div>
              </Button>
            )}
            <div ref={bottomRef} />
          </form>
        </Form>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="flex flex-col bg-[#1C1C1C] gap-6 sm:gap rounded-3xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto max-w-[90vw] sm:max-w-2xl lg:max-w-4xl mx-auto !p-0">
          <VerifyOTP
            verificationType="contact"
            contactInfo={contactInfo}
            errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
            setIsDialogOpen={setIsDialogOpen}
            verificationId={verificationId}
            onResendOtp={() => handleVerifyClick(contactInfo)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isPaymentDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-h-[70vh] sm:max-h-[90vh] overflow-y-auto max-w-[90vw] sm:max-w-[500px] mx-auto bg-[#1C1C1C] text-white rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
          <img
            src="/assets/images/make-payment.svg"
            className="mx-auto mb-8"
            alt="payment"
          />
          <div>
            <div className="text-2xl font-semibold ">Admission Fee Payment</div>
            <div className="mt-2 text-xs sm:text-sm font-normal text-center">
              Make an admission fee payment of INR {applicationFees || 0}.00 to
              move to the next step of your admission process
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              size="xl"
              className="px-4 mx-auto bg-[#00AB7B] hover:bg-[#00AB7B]/90"
              type="button"
              onClick={() => handlePayment()}
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                {loading ? "Initializing Payment..." : "Make Payment"}
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PaymentSuccessDialog
        open={successDialogOpen}
        setOpen={setSuccessDialogOpen}
        type="step1"
        mail={studentData?.email || "your email"}
        fee={applicationFees || 0}
        onContinue={handleContinueToDashboard}
      />
      <PaymentFailedDialog
        open={failedDialogOpen}
        setOpen={setFailedDialogOpen}
        type="step1"
        mail={studentData?.email || "your email"}
        onContinue={handleRetry}
        amount={applicationFees}
      />
      <div id="recaptcha-container"></div>
    </>
  );
};

export default ApplicationDetailsForm;
