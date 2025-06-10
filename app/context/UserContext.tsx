"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentStudent } from "~/api/studentAPI"
import { InitializeInterceptor } from "~/utils/interceptor"

interface UserContextType {
  studentData: any
  setStudentData: (data: any) => void
  refreshStudentData: () => Promise<void>
  isRefreshing: boolean
  accessToken: string | null
  refreshToken: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentData, setStudentData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  // Initialize tokens from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAccessToken = localStorage.getItem("accessToken")
      const storedRefreshToken = localStorage.getItem("refreshToken")
      const storedStudentData = localStorage.getItem("studentData")

      if (storedAccessToken) setAccessToken(storedAccessToken)
      if (storedRefreshToken) setRefreshToken(storedRefreshToken)
      if (storedStudentData) {
        try {
          setStudentData(JSON.parse(storedStudentData))
        } catch (error) {
          console.error("Failed to parse stored student data:", error)
          localStorage.removeItem("studentData")
        }
      }

      // Initialize the interceptor with current tokens
      InitializeInterceptor((isUnauthorized) => {
        if (isUnauthorized) {
          clearTokens()
        }
      })
    }
  }, [])

  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", newAccessToken)
      localStorage.setItem("refreshToken", newRefreshToken)
    }

    // Re-initialize interceptor with new tokens
    InitializeInterceptor((isUnauthorized) => {
      if (isUnauthorized) {
        clearTokens()
      }
    })
  }

  const clearTokens = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setStudentData(null)

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("studentData")
    }
  }

  const refreshStudentData = async () => {
    setIsRefreshing(true)
    try {
      if (!studentData || !studentData._id) {
        console.log("Cannot refresh: No student ID available")
        return
      }

      console.log("Refreshing student data...")
      const freshData = await getCurrentStudent(studentData._id)

      if (freshData) {
        // Update localStorage
        localStorage.setItem("studentData", JSON.stringify(freshData))
        // Update context
        setStudentData(freshData)
        console.log("Student data refreshed successfully")
      }
    } catch (error) {
      console.error("Failed to refresh student data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
      <UserContext.Provider
          value={{
            studentData,
            setStudentData,
            refreshStudentData,
            isRefreshing,
            accessToken,
            refreshToken,
            setTokens,
            clearTokens,
          }}
      >
        {children}
      </UserContext.Provider>
  )
}
