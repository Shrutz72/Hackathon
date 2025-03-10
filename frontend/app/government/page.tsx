"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Building, ArrowLeft, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="flex flex-col min-h-dvh">
      {/* Header styled like the CommUnity app */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Users className="h-6 w-6 text-primary group-hover:animate-spin-slow transition-all duration-300" />
            <span className="text-xl font-bold text-gradient">CommUnity</span>
          </Link>
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gradient-mesh py-20">
        <div className="container max-w-md px-4">
          <Card className="border-purple-light/20 animate-scaleUp card-hover shadow-lg">
            <CardHeader className="pb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-blue-gradient text-white">
                <Building className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Government Login</CardTitle>
            </CardHeader>
            
            <CardContent>
              {error && (
                <div className="mb-6 p-3 bg-red-100/80 text-red-700 rounded-md text-sm border border-red-200 animate-scaleUp">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Government ID"
                    value={governmentId}
                    onChange={(e) => setGovernmentId(e.target.value)}
                    className="h-12 border-purple-light/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-purple-light/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform text-black font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Link
                  href="/government/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-bold text-gradient">CommUnity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CommUnity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}