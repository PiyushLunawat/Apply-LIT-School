"use client"

import type React from "react"
import { createContext, useCallback, useEffect, useState } from "react"
import { getCurrentStudent } from "~/api/studentAPI"

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

export const UserContext = createContext<UserContextType>({
  studentData: {},
  setStudentData: () => {},
  refreshStudentData: async () => {},
  isRefreshing: false,
  accessToken: null,
  refreshToken: null,
  setTokens: () => {},
  clearTokens: () => {},
})

export const UserProvider: React.FC<{
  children: React.ReactNode
  accessToken?: string
  refreshToken?: string
}> = ({ children, accessToken: initialAccessToken, refreshToken: initialRefreshToken }) => {
  const [studentData, setStudentData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken || null)
  const [refreshToken, setRefreshToken] = useState<string | null>(initialRefreshToken || null)

  // Initialize from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem("studentData")
    const storedAccessToken = localStorage.getItem("accessToken")
    const storedRefreshToken = localStorage.getItem("refreshToken")

    if (storedData) {
      setStudentData(JSON.parse(storedData))
    }

    // Use stored tokens if no initial tokens provided
    if (!initialAccessToken && storedAccessToken) {
      setAccessToken(storedAccessToken)
    }
    if (!initialRefreshToken && storedRefreshToken) {
      setRefreshToken(storedRefreshToken)
    }
  }, [initialAccessToken, initialRefreshToken])

  // Update localStorage when tokens change
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken)
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken)
    }
  }, [accessToken, refreshToken])

  const setTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    localStorage.setItem("accessToken", newAccessToken)
    localStorage.setItem("refreshToken", newRefreshToken)
  }, [])

  const clearTokens = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("studentData")
    setStudentData(null)
  }, [])

  // Function to refresh student data from the API
  const refreshStudentData = useCallback(async () => {
    if (!studentData || !studentData._id) {
      console.log("Cannot refresh: No student ID available")
      return
    }

    try {
      setIsRefreshing(true)
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
      console.error("Error refreshing student data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [studentData])

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedData = localStorage.getItem("studentData")
      if (updatedData) {
        setStudentData(JSON.parse(updatedData))
      } else {
        setStudentData(null)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

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
