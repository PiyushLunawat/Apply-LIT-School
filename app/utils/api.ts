// app/utils/api.ts

  // Fetch all cohorts
  export async function getCohorts() {
    const response = await fetch("http://localhost:4000/admin/cohort");
    if (!response.ok) {
      throw new Error("Failed to fetch cohorts");
    }
    return response.json();
  }

  export async function getCentres() {
    const response = await fetch("http://localhost:4000/admin/center");
    if (!response.ok) {
      throw new Error("Failed to fetch centres");
    }
    return response.json();
  }

  // Fetch all programs
export async function getPrograms() {
  const response = await fetch("http://localhost:4000/admin/program");
  if (!response.ok) {
    throw new Error("Failed to fetch programs");
  }
  return response.json();
}

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
    const response = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Sign-up failed');
    }
  
    return response.json();
  }
  
  export async function verifyOtp(data: { email: string; otp: string }) {
    const response = await fetch('http://localhost:4000/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('OTP verification failed');
    }
  
    return response.json();
  }
  
  export async function resendOtp(data: { email: string }) {
    const response = await fetch('http://localhost:4000/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Failed to resend OTP');
    }
  
    return response.json();
  }
  
  export async function loginOTP(data: {email: string}) {
    const response = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Failed to resend OTP');
    }
  
    return response.json();
  }