// utils/authAPI.ts
import { getEnvValue } from "~/atoms/envAtoms"

const baseUrl = getEnvValue("REMIX_PUBLIC_API_BASE_URL")

// Helper function to get access token
const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

// Helper function to get refresh token
const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken")
  }
  return null
}

// Helper function to create headers with auth
const createHeaders = (): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

// Helper function to handle token refresh
const handleTokenRefresh = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error("Token refresh failed")
    }

    const data = await response.json()

    // Update localStorage with new tokens
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken)
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
    // Clear invalid tokens
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("studentData")
    return null
  }
}

// Enhanced fetch wrapper with automatic token refresh
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let headers = createHeaders()

  // Merge with existing headers
  if (options.headers) {
    headers = { ...headers, ...options.headers }
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newTokens = await handleTokenRefresh()

    if (newTokens) {
      // Retry the request with new token
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newTokens.accessToken}`,
      }

      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      })
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/auth/login"
      throw new Error("Authentication failed")
    }
  }

  return response
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
  const response = await fetchWithAuth(`${baseUrl}/auth/signup`, {
    method: "POST",
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
  const response = await fetchWithAuth(`${baseUrl}/auth/verify-otp`, {
    method: "POST",
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
  const response = await fetchWithAuth(`${baseUrl}/auth/resend-otp`, {
    method: "POST",
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
    headers: { "Content-Type": "application/json" },
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
  const response = await fetchWithAuth(`${baseUrl}/student/verify-mobile-number`, {
    method: "POST",
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
  const response = await fetchWithAuth(`${baseUrl}/student/verify-otp-number`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => null)
    throw new Error(`${errorDetails ? `${errorDetails.message || JSON.stringify(errorDetails)}` : ""}`)
  }

  return response.json()
}

// Refresh token function (for manual use)
export async function refreshTokens(refreshPayload: any) {
  console.log("api Payload", refreshPayload)

  const response = await fetch(`${baseUrl}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refreshPayload),
  })

  const json = await response.json()
  console.log("api res json", json)

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`)
  }

  return json
}

// Export the token refresh function for external use
export { handleTokenRefresh }
