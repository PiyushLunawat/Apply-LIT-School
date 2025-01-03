const CONST_API = "http://localhost:4000";
// const CONST_API = "https://myfashionfind.shop";

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
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
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
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
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
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
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
    const errorDetails = await response.json().catch(() => null); // Handle cases where the response is not JSON
    throw new Error(
      `${
        errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""
      }`
    );
  }

  return response.json();
}

// Verify Mobile Number API
export async function verifyNumber(data: { phone: string }) {
  const response = await fetch(`${CONST_API}/student/verify-mobile-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: data.phone }),
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

// Verify Mobile OTP
export async function verifyMobileOTP(data: { mobileNumber: string; otp: string }) {
  const response = await fetch(`${CONST_API}/student/verify-otp-number`, {
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
