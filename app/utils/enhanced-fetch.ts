// Enhanced fetch wrapper that handles token refresh and retries
import { refreshTokens } from "~/api/authAPI"

let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })

    failedQueue = []
}

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

// Enhanced fetch with automatic token refresh and retry
export const enhancedFetch = async (url: string | Request, options: RequestInit = {}): Promise<Response> => {
    const accessToken = getAccessToken()

    // Add authorization header if token exists
    if (accessToken) {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        }
    }

    // Make the initial request
    let response = await fetch(url, options)

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401) {
        const refreshToken = getRefreshTokenFromStorage()

        if (refreshToken) {
            if (isRefreshing) {
                // If already refreshing, wait for it to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    // Retry the original request with new token
                    const newOptions = {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${token}`,
                        },
                    }
                    return fetch(url, newOptions)
                })
            }

            isRefreshing = true

            try {
                const result = await refreshTokens({ refreshToken })

                if (result?.success && result.accessToken) {
                    // Update localStorage with new tokens
                    localStorage.setItem("accessToken", result.accessToken)
                    if (result.refreshToken) {
                        localStorage.setItem("refreshToken", result.refreshToken)
                    }

                    // Process the queue with the new token
                    processQueue(null, result.accessToken)

                    // Retry the original request with new token
                    const newOptions = {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${result.accessToken}`,
                        },
                    }

                    response = await fetch(url, newOptions)
                } else {
                    // Refresh failed, clear tokens
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("studentData")

                    processQueue(new Error("Token refresh failed"), null)

                    // Redirect to login
                    window.location.href = "/auth/login"
                }
            } catch (error) {
                // Refresh failed, clear tokens
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("studentData")

                processQueue(error, null)

                // Redirect to login
                window.location.href = "/auth/login"
            } finally {
                isRefreshing = false
            }
        } else {
            // No refresh token, redirect to login
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("studentData")
            window.location.href = "/auth/login"
        }
    }

    return response
}

// Export as default fetch replacement
export default enhancedFetch
