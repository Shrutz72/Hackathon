"use client"
//login
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Building, ArrowLeft } from "lucide-react"

export default function GovernmentLogin() {
  const router = useRouter()
  const [governmentId, setGovernmentId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login process
    setTimeout(() => {
      // For demo purposes, let's use a simple validation
      if (governmentId && password) {
        // Store login state in localStorage or use a more robust state management solution
        localStorage.setItem("governmentLoggedIn", "true")
        // Redirect to dashboard
        router.push("/government/dashboard")
      } else {
        setError("Invalid Government ID or password")
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
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
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

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Government Login</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="Government ID"
              value={governmentId}
              onChange={(e) => setGovernmentId(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center text-gray-600">
            <Link href="/government/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

