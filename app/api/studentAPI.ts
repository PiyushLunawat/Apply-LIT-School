// utils/authAPI.ts
import { getEnvValue } from "~/atoms/envAtoms";

const baseUrl = getEnvValue("REMIX_PUBLIC_API_BASE_URL");

// Fetch all cohorts
export async function getCohorts() {
  const response = await fetch(`${baseUrl}/student/cohort`);

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function getCohortById(id: string) {
  const response = await fetch(`${baseUrl}/student/cohort/${id}`);
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

// Fetch all centres
export async function getCentres() {
  const response = await fetch(`${baseUrl}/student/center`);

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

// Fetch all programs
export async function getPrograms() {
  const response = await fetch(`${baseUrl}/student/program`);

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function getCurrentStudent(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/student/profile/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : "Failed to fetch student profile."
      }`
    );
  }

  return response.json();
}

// Save application function
export async function saveApplication(formdata: any) {
  const response = await fetch(`${baseUrl}/student/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formdata),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to save application ${response.status}`
    );
  }
  return response.json();
}

// Submit application function
export async function submitApplication(formdata: any) {
  const response = await fetch(`${baseUrl}/student/submit-application`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formdata),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function submitApplicationTask(formData: any) {
  const response = await fetch(`${baseUrl}/student/submit-application-task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function GetInterviewers(data: {
  cohortId: string;
  role: string;
}): Promise<any> {
  const response = await fetch(`${baseUrl}/student/interviewers-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null);
    throw new Error(
      errorDetails
        ? `${errorDetails.message || JSON.stringify(errorDetails)}`
        : "Request failed"
    );
  }
  return response.json();
}

export async function submitLITMUSTest(formData: any) {
  const response = await fetch(`${baseUrl}/student/litmus-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function submitLitmusFeedback(formData: any) {
  const response = await fetch(`${baseUrl}/student/feedack-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

// New API for uploading student documents
export async function uploadStudentDocuments(formData: any) {
  const response = await fetch(`${baseUrl}/student/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return await response.json();
}

// New API for fee setup
export async function setupFeePayment(feeData: any) {
  try {
    const response = await fetch(`${baseUrl}/student/fee-setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feeData),
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Handle non-JSON responses
      throw new Error(
        `${
          errorDetails
            ? `${errorDetails.message || JSON.stringify(errorDetails)}`
            : "Unknown error occurred"
        }`
      );
    }

    return response.json();
  } catch (error: any) {
    console.error("setupFeePayment error:", error.message);
    throw error;
  }
}

export async function submitTokenReceipt(formData: any) {
  const response = await fetch(`${baseUrl}/student/token-receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return await response.json();
}

export async function payApplicationFee(feePayLoad: any) {
  const response = await fetch(`${baseUrl}/student/pay-application-fee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feePayLoad),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null);
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : ""
      }`
    );
  }
  return response.json();
}

export async function verifyApplicationFeePayment(orderId: string) {
  const response = await fetch(`${baseUrl}/student/payment/status/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null);
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : "Payment verification failed"
      }`
    );
  }
  return response.json();
}

export async function uploadFeeReceipt(formData: any) {
  const response = await fetch(
    `${baseUrl}/student/upload-semester-fee-installments`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null);
    throw new Error(
      `${
        errorDetails
          ? `${errorDetails.message || JSON.stringify(errorDetails)}`
          : "Failed to upload fee receipt"
      }`
    );
  }
  return await response.json();
}

export async function updateStudentData(
  data:
    | FormData
    | Partial<{
        profileImage: File;
        bloodGroup: string;
        linkedInUrl: string;
        instagramUrl: string;
        mobileNumber: string;
        isMobileVerified: boolean;
      }>
): Promise<any> {
  try {
    const response = await fetch(`${baseUrl}/student/student-data`, {
      method: "POST", // Using PATCH for partial updates,
      credentials: "include",
      headers:
        data instanceof FormData
          ? {} // Let the browser set the Content-Type for FormData
          : { "Content-Type": "application/json" }, // Set Content-Type for JSON data
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Handle non-JSON responses
      throw new Error(
        `${
          errorDetails
            ? errorDetails.message || JSON.stringify(errorDetails)
            : "Failed to update student data."
        }`
      );
    }

    return response.json(); // Return the updated student data
  } catch (error: any) {
    console.error("updateStudentData error:", error.message);
    throw new Error(`Update failed: ${error.message}`);
  }
}
