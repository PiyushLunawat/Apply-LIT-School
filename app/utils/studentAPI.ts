// const baseUrl = "http://51.21.131.240:4000";
// const baseUrl = "http://localhost:4000";
const baseUrl = "https://dev.apply.litschool.in";
// const baseUrl = "https://myfashionfind.shop";

// const baseUrl = `${
//   typeof process !== "undefined" ? process.env.API_BASE_URL : ""
// }`;

// Fetch all cohorts
export async function getCohorts() {
  const response = await fetch(`${baseUrl}/admin/cohort`);

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
  const response = await fetch(`${baseUrl}/admin/cohort/${id}`);
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
  const response = await fetch(`${baseUrl}/admin/center`);

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
  const response = await fetch(`${baseUrl}/admin/program`);

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

export async function getStudents() {
  const response = await fetch(`${baseUrl}/admin/students`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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

export async function getCurrentStudent(id: string) {
  const response = await fetch(`${baseUrl}/student/${id}`, {
    method: "GET",
    // headers: { "Content-Type": "application/json" },
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

// Submit application function
export async function submitApplication(formdata: any) {
  try {
    const response = await fetch(`${baseUrl}/student/submit-application`, {
      method: "POST",
      body: formdata,
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => null); // Catch cases where response is not JSON
      throw new Error(
        `${
          errorDetails
            ? `${errorDetails.message || JSON.stringify(errorDetails)}`
            : "Failed to submit application"
        }`
      );
    }

    return response.json();
  } catch (error: any) {
    console.error("Error submitting application:", error);
    throw new Error(`Application submission failed: ${error.message}`);
  }
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

// New API for uploading student documents
export async function uploadStudentDocuments(formData: FormData) {
  const response = await fetch(`${baseUrl}/student/documents`, {
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

export async function submitTokenReceipt(formData: FormData) {
  const response = await fetch(`${baseUrl}/student/token-receipt`, {
    method: "POST",
    body: formData,
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

export async function payApplicationFee(amount: number, currency: string) {
  const response = await fetch(`${baseUrl}/student/pay-application-fee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appFeeData: {
        currency,
        amount: amount * 100, // Convert to smallest currency unit
        receipt: "",
      },
    }),
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

export async function verifyApplicationFeePayment(data: {
  appFeeData: {
    currency: string;
    amount: number;
    receipt: string;
  };
  studentId: string;
  cohortId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await fetch(
    `${baseUrl}/student/verify-application-fee-payement`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

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
      method: "POST",
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
      method: "POST", // Using PATCH for partial updates
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
