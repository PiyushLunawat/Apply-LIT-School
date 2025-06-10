"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp"
import { Label } from "~/components/ui/label"
import { useToast } from "~/hooks/use-toast"
import { useAuth } from "~/hooks/use-auth"
import { verifyOtp, resendOtp } from "~/api/authAPI"

export default function VerifyOTP() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()

  const email = searchParams.get("email") || ""

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      })
      return
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please go back and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyOtp({ email, otp })

      if (response.success) {
        // Use the login function from useAuth hook
        login(
            {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            response.user || response.student,
        )

        toast({
          title: "Success",
          description: "OTP verified successfully!",
        })

        navigate("/dashboard")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "OTP verification failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please go back and try again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      await resendOtp({ email })

      toast({
        title: "Success",
        description: "OTP sent successfully!",
      })

      setCountdown(60) // 60 seconds countdown
      setOtp("") // Clear current OTP
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend OTP",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify OTP</h2>
          <p className="text-gray-600 mt-2">We've sent a 6-digit code to {email}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center">
          <Button type="button" variant="link" onClick={handleResendOTP} disabled={isResending || countdown > 0}>
            {isResending ? "Resending..." : countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
          </Button>
        </div>
      </form>
  )
}
