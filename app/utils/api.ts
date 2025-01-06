// const CONST_API = "http://localhost:4000";
const CONST_API = "https://myfashionfind.shop";

// Fetch all cohorts
export async function getCohorts() {
  const response = await fetch(`${CONST_API}/admin/cohort`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch cohorts");
  }
  return response.json();
}

// Fetch all centres
export async function getCentres() {
  const response = await fetch(`${CONST_API}/admin/center`);
  if (!response.ok) {
    throw new Error("Failed to fetch centres");
  }
  return response.json();
}

// Fetch all programs
export async function getPrograms() {
  const response = await fetch(`${CONST_API}/admin/program`);
  if (!response.ok) {
    throw new Error("Failed to fetch programs");
  }
  return response.json();
}

// Sign-up function
export async function signUp(data: {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  program: string;
  cohort: string;
  dateOfBirth: string;
  qualification: string;
}) {
  const response = await fetch(`${CONST_API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Sign-up failed");
  }

  return response.json();
}

// OTP verification function
export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await fetch(`${CONST_API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("OTP verification failed");
  }

  return response.json();
}

// Resend OTP function
export async function resendOtp(data: { email: string }) {
  const response = await fetch(`${CONST_API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to resend OTP");
  }

  return response.json();
}

// Login with OTP function
export async function loginOTP(data: { email: string }) {
  const response = await fetch(`${CONST_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to resend OTP");
  }

  return response.json();
}

export async function verifyNumber(data: { phone: string }) {
  const response = await fetch(`${CONST_API}/student/verify-mobile-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({mobileNumber: data.phone}),
  });

  if (!response.ok) {
    throw new Error("Failed to verify number");
  }

  return response.json();
}

// Verify Mobile Number API
export async function verifyMobileOTP(data: { mobileNumber: string; otp: string }) {
  const response = await fetch(`${CONST_API}/student/verify-otp-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Mobile number verification failed");
  }

  return response.json();
}


// Submit application function
export async function submitApplication(data: {
  studentData:{
  firstName: string;
  lastName: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  email: string;
  qualification?: string;
  program?: string;
  cohort?: string;
  gender: string;
  isVerified?: boolean;
  profileImage: any;
  linkedInUrl: string;
  instagramUrl: string;
  dateOfBirth: Date;
  };
  applicationData: {
    currentAddress: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
    };
    previousEducation: {
      highestLevelOfEducation: string;
      fieldOfStudy: string;
      nameOfInstitution: string;
      yearOfGraduation: number;
    };
    workExperience: boolean;
    emergencyContact: {
      firstName: string;
      lastName: string;
      contactNumber: string;
      relationshipWithStudent: string;
    };
    parentInformation: {
      father: {
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
        occupation: string;
      };
      mother: {
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
        occupation: string;
      };
    };
    financialInformation: {
      isFinanciallyIndependent: boolean;
      hasAppliedForFinancialAid: boolean;
    };
  };
}) {
  const response = await fetch(`${CONST_API}/student/submit-application`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Application submission failed");
  }

  return response.json();
}