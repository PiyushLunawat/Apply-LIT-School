// const baseUrl = "http://51.21.131.240:4000";
// const baseUrl = "http://localhost:4000";
const baseUrl = "https://dev.apply.litschool.in";
// const baseUrl = "https://myfashionfind.shop";

// const baseUrl = `${
//   typeof process !== "undefined" ? process.env.API_BASE_URL : ""
// }`;

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
  const response = await fetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

// OTP verification function
export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await fetch(`${baseUrl}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

// Resend OTP function
export async function resendOtp(data: { email: string }) {
  const response = await fetch(`${baseUrl}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

// Login with OTP function
export async function loginOTP(data: { email: string }) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

// Verify Mobile Number API
export async function verifyNumber(data: { phone: string }) {
  const response = await fetch(`${baseUrl}/student/verify-mobile-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: data.phone }),
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

// Verify Mobile OTP
export async function verifyMobileOTP(data: {
  mobileNumber: string;
  otp: string;
}) {
  const response = await fetch(`${baseUrl}/student/verify-otp-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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
