"use client"

import { useContext } from "react"
import { UserContext } from "~/context/UserContext"

export const useAuth = () => {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error("useAuth must be used within a UserProvider")
    }

    const {
        studentData,
        setStudentData,
        refreshStudentData,
        isRefreshing,
        accessToken,
        refreshToken,
        setTokens,
        clearTokens,
    } = context

    const isAuthenticated = !!accessToken && !!studentData
    const isLoading = isRefreshing

    const login = (tokens: { accessToken: string; refreshToken: string }, userData: any) => {
        setTokens(tokens.accessToken, tokens.refreshToken)
        setStudentData(userData)
        localStorage.setItem("studentData", JSON.stringify(userData))
    }

    const logout = () => {
        clearTokens()
        // Redirect to login page
        window.location.href = "/auth/login"
    }

    return {
        // User data
        user: studentData,
        setUser: setStudentData,

        // Authentication state
        isAuthenticated,
        isLoading,

        // Tokens
        accessToken,
        refreshToken,

        // Actions
        login,
        logout,
        refreshUserData: refreshStudentData,
        setTokens,
        clearTokens,
    }
}
