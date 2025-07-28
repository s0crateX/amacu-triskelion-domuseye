"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { sendPasswordReset } from "@/lib/auth/auth-utils"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")
  const [cooldown, setCooldown] = useState(0)

  // Cooldown timer effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // Check cooldown
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before trying again`)
      return
    }

    setLoading(true)

    try {
      await sendPasswordReset(email)
      setEmailSent(true)
      setCooldown(60) // 60 second cooldown
      toast.success("Password reset email sent successfully!")
    } catch (error: unknown) {
      console.error('Password reset error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email'
      toast.error(errorMessage)
      
      // Set a shorter cooldown even on error to prevent spam
      setCooldown(30)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Image 
                src="/assets/images/logo.png" 
                alt="DomusEye Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8 dark:invert"
              />
              <span className="text-2xl font-bold text-foreground">DomusEye</span>
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
            <p className="text-muted-foreground mt-2">We&apos;ve sent password reset instructions to your email</p>
          </div>

          {/* Success Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Email sent successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={() => router.push('/login')} 
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEmailSent(false)
                      setEmail("")
                    }}
                    className="w-full"
                  >
                    Send to different email
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button 
                      onClick={() => {
                        setEmailSent(false)
                        setEmail("")
                      }}
                      className="text-primary hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Image 
              src="/assets/images/logo.png" 
              alt="DomusEye Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8 dark:invert"
            />
            <span className="text-2xl font-bold text-foreground">DomusEye</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Forgot your password?</h1>
          <p className="text-muted-foreground mt-2">Enter your email address and we&apos;ll send you a link to reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              We&apos;ll send you an email with instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s before trying again`
                ) : (
                  "Send Reset Email"
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-6">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Sign In
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}