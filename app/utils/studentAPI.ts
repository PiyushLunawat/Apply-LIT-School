// const CONST_API = "http://localhost:4000";
const CONST_API = "https://myfashionfind.shop";

// Fetch all cohorts
export async function getCohorts() {
  const response = await fetch(`${CONST_API}/admin/cohort`);
  
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }
  return response.json();
}

// Fetch all centres
export async function getCentres() {
  const response = await fetch(`${CONST_API}/admin/center`);
  
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }
  return response.json();
}

// Fetch all programs
export async function getPrograms() {
  const response = await fetch(`${CONST_API}/admin/program`);
  
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }
  return response.json();
}

export async function getStudents() {
  const response = await fetch(`${CONST_API}/admin/students`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }
  return response.json();
}


export async function getCurrentStudent(id: string) {
  const response = await fetch(`${CONST_API}/admin/student/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
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
    console.log("laaaaaaaa",data);
    const response = await fetch(`${CONST_API}/student/submit-application`, {    
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }
  return response.json();
}

export async function submitApplicationTask(formData: FormData) {
    const response = await fetch(`${CONST_API}/student/submit-application-task`, {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
      throw new Error(
        `${
          errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
        }`
      );
    }
    return response.json();
  }
  
  export async function submitLITMUSTest(formData: FormData, litmusTaskId: string) {
    formData.append('litmusTaskId', litmusTaskId);
    console.log("sgsf",formData)
    const response = await fetch(`${CONST_API}/student/litmus-test`, {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
      throw new Error(
        `${
          errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
        }`
      );
    }
    return response.json();
  }
  
  // New API for uploading student documents
  export async function uploadStudentDocuments(formData: FormData) {
    const response = await fetch(`${CONST_API}/student/documents`, {
      method: "POST",
      // Do not set Content-Type headers, fetch will handle it for FormData
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload student documents");
    }
  
    return await response.json();
  }

  
  // New API for fee setup
  export async function setupFeePayment(feeData: FormData) {
    const response = await fetch(`${CONST_API}/student/fee-setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feeData),
    });
  
    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
      throw new Error(
        `${
          errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
        }`
      );
    }
    return response.json();
  }