"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Building, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPassword() {
  const router = useRouter()
  const [governmentId, setGovernmentId] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate password reset process
    setTimeout(() => {
      if (governmentId && email) {
        setIsSubmitted(true)
      } else {
        setError("Please fill in all required fields")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header with back button */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/government">
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-blue-100">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Link Sent</h2>
              <p className="text-gray-600 mb-6">
                If your Government ID and email are valid, you will receive instructions to reset your password shortly.
              </p>
              <Link href="/government">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Government ID"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

