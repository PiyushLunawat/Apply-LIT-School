"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useToast } from "~/hooks/use-toast"
import { useAuth } from "~/hooks/use-auth"
import { signUp } from "~/api/authAPI"

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        program: "",
        cohort: "",
        dateOfBirth: "",
        qualification: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()
    const { login } = useAuth()

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        const requiredFields = [
            "firstName",
            "lastName",
            "email",
            "mobileNumber",
            "program",
            "cohort",
            "dateOfBirth",
            "qualification",
        ]
        const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

        if (missingFields.length > 0) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await signUp(formData)

            if (response.success) {
                // If signup returns tokens and user data immediately
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
                        description: "Account created successfully!",
                    })

                    navigate("/dashboard")
                } else {
                    // If OTP verification is required
                    toast({
                        title: "Success",
                        description: "Account created! Please verify your email.",
                    })

                    navigate(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`)
                }
            }
        } catch (error) {
            console.error("Signup error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Signup failed",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select onValueChange={(value) => handleInputChange("program", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="mobile-development">Mobile Development</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cohort">Cohort</Label>
                <Select onValueChange={(value) => handleInputChange("cohort", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select cohort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024-q1">2024 Q1</SelectItem>
                        <SelectItem value="2024-q2">2024 Q2</SelectItem>
                        <SelectItem value="2024-q3">2024 Q3</SelectItem>
                        <SelectItem value="2024-q4">2024 Q4</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                    id="qualification"
                    type="text"
                    placeholder="Enter your qualification"
                    value={formData.qualification}
                    onChange={(e) => handleInputChange("qualification", e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
        </form>
    )
}
