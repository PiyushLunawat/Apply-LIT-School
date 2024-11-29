// Import necessary modules and components
import React, { useContext, useState } from 'react';
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
import { Instagram, Linkedin, SaveIcon } from 'lucide-react';
import { UserContext } from '~/context/UserContext';
import { PaymentFailedDialog, PaymentSuccessDialog } from '../PaymentDialog/PaymentDialog';
import { submitApplication } from '~/utils/studentAPI';

type ExperienceType = 'employee' | 'business' | 'freelancer' | 'consultant';

const formSchema = z.object({
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
  fatherEmail: z.string().email("Father's email is required"),
  motherFirstName: z.string().nonempty("Mother's first name is required"),
  motherLastName: z.string().nonempty("Mother's last name is required"),
  motherContact: z.string().min(10, "Mother's contact number is required"),
  motherOccupation: z.string().nonempty("Mother's occupation is required"),
  motherEmail: z.string().email("Mother's email is required"),
  financiallyDependent: z.boolean(),
  appliedForFinancialAid: z.boolean(),
}).refine(
  (data) => data.emergencyContact !== data.fatherContact,
  {
    message: "Emergency contact and father's contact must be different.",
    path: ["fatherContact"], // Error for fatherContact
  }
)
.refine(
  (data) => data.emergencyContact !== data.motherContact,
  {
    message: "Emergency contact and mother's contact must be different.",
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
  (data) => data.fatherEmail !== data.motherEmail,
  {
    message: "Father's email and mother's email must be different.",
    path: ["motherEmail"], // Error for mother's email
  }
);

type FormData = z.infer<typeof formSchema>;

const ApplicationDetailsForm: React.FC = () => {
  const { studentData } = useContext(UserContext); 
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(null);
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [failedDialogOpen, setFailedDialogOpen] = useState(false);


  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedin: "",
      instagram: "",
      gender: "Male",
      address: '',
      city: '',
      zipcode: '',
      educationLevel: '',
      fieldOfStudy: '',
      institutionName: '',
      graduationYear: '',
      hasWorkExperience: false,
      experienceType: 'employee',
      jobDescription: '',
      companyName: '',
      workDuration: '',
      companyStartDate: '',
      durationOfWork: '',
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
  });

  const { control, handleSubmit, watch } = form;

  // Watch fields for conditional rendering
  const watchHasWorkExperience = watch('hasWorkExperience');
  const watchExperienceType = watch('experienceType');

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
  const handlePayment = async (apiPayload: any) => {
    // Load the Razorpay script
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const data = await fetch('http://localhost:4000/student/submit-application', {
      method: 'POST',
  headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    if (data.ok) {
      // Handle success response
      console.log('Form submitted successfully');
    } else {
      // Handle error response
      console.error('Form submission failed');
    }
    console.log('Order data:', data);

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
        fetch('http://localhost:4000/student/verify-application-fee-payement', {
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
  const onSubmit = async (data: FormData) => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      return;
    }
    
  
 
    const apiPayload = {
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
    
      // appFeeData: {
      //   currency: "INR",
      //   amount: 500, // Amount in paise (e.g., 50000 paise = 500 INR)
      //   receipt: "", 
      // },
      // applicationData: {
      //   currentAddress: {
      //     streetAddress: data.address,
      //     city: data.city,
      //     state: "", // Optional: Add state if available
      //     postalCode: data.zipcode,
      //   },
      //   previousEducation: {
      //     highestLevelOfEducation: data.educationLevel,
      //     fieldOfStudy: data.fieldOfStudy,
      //     nameOfInstitution: data.institutionName,
      //     yearOfGraduation: parseInt(data.graduationYear, 10),
      //   },
      //   workExperience: data.hasWorkExperience,
      //   emergencyContact: {
      //     firstName: data.emergencyFirstName,
      //     lastName: data.emergencyLastName,
      //     contactNumber: data.emergencyContact,
      //     relationshipWithStudent: data.relationship,
      //   },
      //   parentInformation: {
      //     father: {
      //       firstName: data.fatherFirstName,
      //       lastName: data.fatherLastName,
      //       contactNumber: data.fatherContact,
      //       occupation: data.fatherOccupation,
      //       email: data.fatherEmail,
      //     },
      //     mother: {
      //       firstName: data.motherFirstName,
      //       lastName: data.motherLastName,
      //       contactNumber: data.motherContact,
      //       occupation: data.motherOccupation,
      //       email: data.motherEmail,
      //     },
      //   },
      //   financialInformation: {
      //     isFinanciallyIndependent: !data.financiallyDependent,
      //     hasAppliedForFinancialAid: data.appliedForFinancialAid,
      //   },
      // },
    };
    
    const formData = new FormData();

    // Append the image file if available
    if (studentData?.profileUrl) {
      formData.append('profileImage', studentData.profileUrl);
    }
  
    // Append apiPayload as a JSON string
    formData.append('studentData', JSON.stringify(apiPayload));
  
    try {
      const response = await fetch('http://localhost:4000/student/submit-application', {
        method: 'POST',
        body: formData, // Send the FormData with file and payload
      });
  
      if (response.ok) {
        // Handle success response
        console.log('Form submitted successfully');
      } else {
        // Handle error response
        console.error('Form submission failed');
      }
  
    } catch (error) {
      console.error("Error submitting application:", error);
      setFailedDialogOpen(true); 
    }
  };
  


  const resubmitForm = handleSubmit(onSubmit);
  const handleRetry = () => {
    setFailedDialogOpen(false); // Close the dialog
    resubmitForm(); // Resubmit the form
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-8">
        
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
                  <Input id="linkedin" placeholder="John Doe" {...field} />
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
              <FormItem className="flex-1 space-y-1">
                <Label htmlFor="graduationYear" className="text-base font-normal pl-3">Year of Graduation</Label>
                <FormControl>
                  <Input id="graduationYear" placeholder="MM/YYYY" {...field} />
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
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="workDuration" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <Input id="workDuration" placeholder="MM/YYYY - MM/YYYY" {...field} />
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
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="companyStartDate" className="text-base font-normal pl-3">When Did You Start Your Company?</Label>
                      <FormControl>
                        <Input id="companyStartDate" placeholder="MM/YYYY" {...field} />
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
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="durationOfWork" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <Input id="durationOfWork" placeholder="MM/YYYY - MM/YYYY" {...field} />
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
                    <FormItem className="flex-1 space-y-1">
                      <Label htmlFor="durationOfWork" className="text-base font-normal pl-3">Approximate Duration of Work</Label>
                      <FormControl>
                        <Input id="durationOfWork" placeholder="MM/YYYY - MM/YYYY" {...field} />
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

        <div className="flex justify-between items-center mt-10">
          <Button variant="link" type='button' onClick={() => form.reset() }>Clear Form</Button>
          <div className='flex gap-2'>
            <Button size="xl" className=' px-4 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="submit" ><SaveIcon className='w-5 h-5'/></Button>
            <Button size="xl" className='space-y-1 bg-[#00AB7B] hover:bg-[#00AB7B]/90' type="button" >Pay INR 500.00</Button>
          </div>
        </div>
      </form>
    </Form>

    <PaymentSuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleContinueToDashboard}/>
    <PaymentFailedDialog open={failedDialogOpen} setOpen={setFailedDialogOpen} type='step1' mail={studentData?.email || 'your email'} onContinue={handleRetry}/>
    </>
  );
};

export default ApplicationDetailsForm;
