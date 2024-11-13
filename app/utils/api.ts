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
