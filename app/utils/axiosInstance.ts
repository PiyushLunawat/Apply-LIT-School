// apiAxiosInstance.ts
import axios from "axios"
import { getEnvValue } from "~/atoms/envAtoms"

const baseUrl = getEnvValue("REMIX_PUBLIC_API_BASE_URL")

const apiAxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
})

// Function to get tokens from localStorage
const getAccessToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken")
    }
    return null
}

const getRefreshToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("refreshToken")
    }
    return null
}

// Function to refresh tokens
const refreshTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return null
    }

    try {
        const response = await axios.post(`${baseUrl}/auth/refresh-token`, {
            refreshToken,
        })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

        // Update localStorage
        if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken)
        }
        if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken)
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
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

// Request interceptor to add auth token
apiAxiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken()
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Response interceptor to handle token expiration and refresh
apiAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If the error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const newTokens = await refreshTokens()

                if (newTokens) {
                    // Update the authorization header and retry the request
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
                    return apiAxiosInstance(originalRequest)
                } else {
                    // Refresh failed, redirect to login
                    window.location.href = "/auth/login"
                    return Promise.reject(error)
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                window.location.href = "/auth/login"
                return Promise.reject(refreshError)
            }
        }

        // For other errors or if refresh failed
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("studentData")
            window.location.href = "/auth/login"
        }

        return Promise.reject(error)
    },
)

export default apiAxiosInstance
