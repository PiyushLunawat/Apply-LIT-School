import fetchIntercept from "fetch-intercept"
import { refreshTokens } from "~/api/authAPI"

// Modify RegisterInterceptor to refresh the token if only accessToken is available
let refreshingToken = false // Flag to prevent infinite refresh loop
let unregister: () => void // Store the unregister function

// Helper functions to get tokens from localStorage
const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

const getRefreshTokenFromStorage = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken")
  }
  return null
}

// Store pending requests during token refresh
let pendingRequests: Array<{
  resolve: (value: [string | Request, RequestInit?]) => void
  reject: (reason?: any) => void
  url: string | Request
  config: RequestInit
}> = []

export const RegisterInterceptor = (
    accessToken?: string | null,
    refreshToken?: string | null,
    setIsUnauthorized?: ((state: boolean) => void) | undefined,
) => {
  // Unregister previous interceptor if exists
  if (unregister) {
    unregister()
  }

  // Register new interceptor
  unregister = fetchIntercept.register({
    request: async (url, config = {}) => {
      if (typeof url !== "string" || !url.trim()) {
        console.log("Invalid URL: Expected a string, but got:", url)
        return [url, config] // Return as is if URL is not a string
      }

      // Skip Firebase endpoints
      if (url.includes("googleapis.com") || url.includes("firebase") || url.includes("firebaseapp.com")) {
        console.log("Skipping Firebase or Google API endpoints.")
        return [url, config]
      }

      const publicEndpoints = [
        "/auth/signup",
        "/auth/sign-up",
        "/auth/login",
        "/auth/resend-otp",
        "/auth/verify-otp",
        "/auth/refresh-token",
        "/student/verify-mobile-number",
        "/student/verify-otp-number",
        "/student/profile",
        "/student/interviewers-list",
        "student/cohort",
        "student/program",
        "student/center",
        "/set-cookies",
        "/logout",
        "/refresh-token",
        "/application",
        "/dashboard",
      ]

      const isPublic = publicEndpoints.some((endpoint) => url.includes(endpoint))

      // Get current tokens from localStorage (most up-to-date)
      const currentAccessToken = getAccessToken() || accessToken
      const currentRefreshToken = getRefreshTokenFromStorage() || refreshToken

      // If both accessToken and refreshToken are not available, trigger the unauthorized state
      if (!isPublic && !currentAccessToken && !currentRefreshToken) {
        console.log("No Access Token or Refresh Token")

        if (setIsUnauthorized) {
          setIsUnauthorized(true) // Set unauthorized state to show login dialog
        }

        return [url, config]
      }

      // If we're currently refreshing tokens, queue this request
      if (refreshingToken && !isPublic) {
        return new Promise<[string | Request, RequestInit?]>((resolve, reject) => {
          pendingRequests.push({ resolve, reject, url, config })
        })
      }

      // If accessToken is missing but refreshToken is available, call the refresh-token API
      if (!isPublic && !currentAccessToken && currentRefreshToken && !refreshingToken) {
        try {
          refreshingToken = true // Set flag to prevent concurrent refresh attempts

          console.log("Access Token is missing, using Refresh Token to get new Access Token", currentRefreshToken)

          const refPayload = {
            refreshToken: currentRefreshToken,
          }

          console.log("int I", refPayload)
          const result = await refreshTokens(refPayload) // Use the correct function name
          console.log("int json", result)

          if (result?.success) {
            // Update localStorage with new tokens
            if (result.accessToken) {
              localStorage.setItem("accessToken", result.accessToken)
            }
            if (result.refreshToken) {
              localStorage.setItem("refreshToken", result.refreshToken)
            }

            // Update cookies with new tokens
            try {
              const response = await fetch("/set-cookies", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accessToken: result.accessToken,
                  refreshToken: result.refreshToken,
                  userId: result.user?.id || result.userId,
                }),
              })

              if (!response.ok) {
                console.warn("Failed to update cookies, but continuing with localStorage tokens")
              }
            } catch (cookieError) {
              console.warn("Cookie update failed:", cookieError)
            }

            // Re-register interceptor with new tokens
            RegisterInterceptor(result.accessToken, result.refreshToken, setIsUnauthorized)

            // Attach the new accessToken to the request headers
            config.headers = {
              ...config.headers,
              authorization: `Bearer ${result.accessToken}`,
            }

            // Process pending requests with new token
            const requestsToProcess = [...pendingRequests]
            pendingRequests = []

            requestsToProcess.forEach(({ resolve, url: pendingUrl, config: pendingConfig }) => {
              const updatedConfig = {
                ...pendingConfig,
                headers: {
                  ...pendingConfig.headers,
                  authorization: `Bearer ${result.accessToken}`,
                },
              }
              resolve([pendingUrl, updatedConfig])
            })
          } else {
            console.error("Failed to refresh tokens.")
            // Clear invalid tokens
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("studentData")

            // Reject pending requests
            const requestsToReject = [...pendingRequests]
            pendingRequests = []
            requestsToReject.forEach(({ reject }) => {
              reject(new Error("Token refresh failed"))
            })

            if (setIsUnauthorized) {
              setIsUnauthorized(true)
            } else {
              // Fallback to redirect if no callback provided
              window.location.href = "/auth/login"
            }
          }

          return [url, config]
        } catch (error) {
          console.error("Error refreshing token:", error)

          // Clear invalid tokens
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("studentData")

          // Reject pending requests
          const requestsToReject = [...pendingRequests]
          pendingRequests = []
          requestsToReject.forEach(({ reject }) => {
            reject(error)
          })

          if (setIsUnauthorized) {
            setIsUnauthorized(true)
          } else {
            // Fallback to redirect if no callback provided
            window.location.href = "/auth/login"
          }

          return [url, config]
        } finally {
          refreshingToken = false // Reset flag regardless of success or failure
        }
      }

      // If both tokens are available, attach accessToken to the request header
      if (!isPublic && currentAccessToken) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${currentAccessToken}`,
        }
      }

      return [url, config]
    },

    // Response interceptor - only for transforming responses, not retrying requests
    response: (response) => {
      // Log response status for debugging
      if (response.status === 401) {
        console.log("Received 401 response - token may be expired")
      }

      return response
    },
  })
}

// Helper function to unregister the interceptor
export const UnregisterInterceptor = () => {
  if (unregister) {
    unregister()
    unregister = undefined as any
  }
}

// Auto-initialize interceptor with tokens from localStorage
export const InitializeInterceptor = (setIsUnauthorized?: (state: boolean) => void) => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshTokenFromStorage()

  if (accessToken || refreshToken) {
    RegisterInterceptor(accessToken, refreshToken, setIsUnauthorized)
  }
}
