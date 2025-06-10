"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useToast } from "~/hooks/use-toast"
import { useAuth } from "~/hooks/use-auth"
import { loginOTP } from "~/api/authAPI"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await loginOTP({ email })

      if (response.success) {
        // If login returns tokens and user data immediately
        if (response.accessToken && response.refreshToken) {
          login(
              {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
              },
              response.user || response.student,
          )

          toast({
            title: "Success",
            description: "Login successful!",
          })

          navigate("/dashboard")
        } else {
          // If OTP needs to be verified
          toast({
            title: "OTP Sent",
            description: "Please check your email for the OTP",
          })

          // Navigate to OTP verification with email
          navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
  )
}
