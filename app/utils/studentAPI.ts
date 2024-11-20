const CONST_API = "http://localhost:4000";
// const CONST_API = "https://myfashionfind.shop";

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

export async function getStudents() {
  const response = await fetch(`${CONST_API}/admin/students`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}

export async function getCurrentStudents(id: string) {
    const response = await fetch(`${CONST_API}/admin/students/application/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }
  
    return response.json(); // Returns parsed JSON data
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
  profileUrl: string;
  linkedInUrl: string;
  instagramUrl: string;
  dateOfBirth: Date;
  };
  appFeeData: {
    currency: string;
    amount: number;
    receipt: string;
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
  const response = await fetch(`${CONST_API}/student/application`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Application submission failed");
  }

  return response.json();
}

export async function submitApplicationTask(data: {
    courseDive: { text1: string; text2: string };
    tasks: Array<{
      text?: string;
      images?: File[];
      videos?: string[];
      files?: (File | string)[];
      links?: string[];
    }>;
  }) {
    const response = await fetch(`${CONST_API}/students/submit-application-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error("Failed to submit application task");
    }
  
    return response.json();
  }
  