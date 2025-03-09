"use client"
//login
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"

export default function ResidentLogin() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState("email") // "email" or "phone"
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
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
      if ((loginMethod === "email" && email && password) || (loginMethod === "phone" && phone && password)) {
        // Store login state in localStorage or use a more robust state management solution
        localStorage.setItem("residentLoggedIn", "true")
        // Redirect to dashboard
        router.push("/resident/dashboard")
      } else {
        setError("Invalid credentials")
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
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resident Login</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Toggle Login Method */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              className={`px-4 py-2 rounded-full transition-colors ${
                loginMethod === "email" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setLoginMethod("email")}
            >
              Email
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full transition-colors ${
                loginMethod === "phone" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setLoginMethod("phone")}
            >
              Phone Number
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginMethod === "email" ? (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            )}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-4 text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/resident/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

