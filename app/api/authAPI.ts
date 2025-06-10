// utils/authAPI.ts
import { getEnvValue } from "~/atoms/envAtoms"
import enhancedFetch from "~/utils/enhanced-fetch"

const baseUrl = getEnvValue("REMIX_PUBLIC_API_BASE_URL")

// Helper function to create headers
const createHeaders = (): HeadersInit => {
  return { "Content-Type": "application/json" }
}

// Sign-up function
export async function signUp(data: {
  firstName: string
  lastName: string
  mobileNumber: string
  email: string
  program: string
  cohort: string
  dateOfBirth: string
  qualification: string
}) {
  const response = await enhancedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }
  return response.json()
}

// OTP verification function
export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await enhancedFetch(`${baseUrl}/auth/verify-otp`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails.error)}` : ""}`)
  }

  return response.json()
}

// Resend OTP function
export async function resendOtp(data: { email: string }) {
  const response = await enhancedFetch(`${baseUrl}/auth/resend-otp`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }

  return response.json()
}

// Login with OTP function
export async function loginOTP(data: { email: string }) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }

  return response.json()
}

// Verify Mobile Number API
export async function verifyNumber(data: { phone: string }) {
  const response = await enhancedFetch(`${baseUrl}/student/verify-mobile-number`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({ mobileNumber: data.phone }),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }

  return response.json()
}

// Verify Mobile OTP
export async function verifyMobileOTP(data: {
  mobileNumber: string
  otp: string
}) {
  const response = await enhancedFetch(`${baseUrl}/student/verify-otp-number`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }

  return response.json()
}

// Refresh token function (for manual use) - Fixed function name
export async function refreshTokens(refreshPayload: any) {
  console.log("api Payload", refreshPayload)

  const response = await fetch(`${baseUrl}/auth/refresh-token`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(refreshPayload),
  })

  const json = await response.json()
  console.log("api res json", json)

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`)
  }

  return json
}

// Legacy function name for backward compatibility
export const getRefreshToken = refreshTokens
