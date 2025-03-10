"use client"
//login
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"

// Add CSS styles directly in the component
const styles = {
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500",
  purpleBlueGradient: "bg-gradient-to-r from-purple-500 to-blue-500",
  bluePurpleGradient: "bg-gradient-to-r from-blue-500 to-purple-500",
  cardHover: "transition-all duration-300 hover:shadow-lg hover:scale-105",
  bgGradientMesh: "bg-gradient-to-br from-blue-50 via-purple-50 to-white",
}

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
    <div className={`min-h-screen ${styles.bgGradientMesh}`}>
      {/* Header with animated back button */}
      <header className="bg-white/70 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-200 transition-colors hover:scale-105 active:scale-95 transition-transform">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            {/* Logo on the right side */}
            <div className="ml-auto flex items-center gap-2 group">
              <Users className="h-6 w-6 text-primary group-hover:animate-spin-slow transition-all duration-300" />
              <span className={`text-xl font-bold ${styles.textGradient}`}>CommUnity</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 flex items-center justify-center animate-fadeIn">
        <div className={`bg-white/90 backdrop-blur p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-100 ${styles.cardHover}`}>
          <div className="flex justify-center mb-6 animate-scaleUp">
            <div className={`p-4 rounded-full ${styles.purpleBlueGradient}`}>
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className={`text-2xl font-bold mb-6 text-center ${styles.textGradient}`}>Resident Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Toggle Login Method */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                loginMethod === "email" 
                  ? `${styles.purpleBlueGradient} text-white` 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setLoginMethod("email")}
            >
              Email
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                loginMethod === "phone" 
                  ? `${styles.bluePurpleGradient} text-white` 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setLoginMethod("phone")}
            >
              Phone Number
            </button>
          </div>

          {/* Login Form with animations */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginMethod === "email" ? (
              <div className="animate-slideInLeft">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/70 border-purple-100 focus:border-purple-300 transition-all"
                />
              </div>
            ) : (
              <div className="animate-slideInRight">
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-white/70 border-purple-100 focus:border-purple-300 transition-all"
                />
              </div>
            )}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/70 border-purple-100 focus:border-purple-300 transition-all"
            />
            <Button 
              type="submit" 
              className={`w-full text-white ${styles.purpleBlueGradient} hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95`} 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Signup Link with gradient underline effect */}
          <div className="mt-6 text-center text-gray-600">
            <div className="flex flex-col items-center">
              <p>Don't have an account?</p>
              <Link 
                href="/resident/signup" 
                className={`mt-2 font-medium ${styles.textGradient} hover:underline transition-all`}
              >
                Sign up
              </Link>
              <div className="h-0.5 w-20 mt-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Additional features section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-4">
              <span className={styles.textGradient}>Trusted by over 10,000+ members</span>
            </div>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">500+</div>
                <div className="text-xs text-gray-500">Events Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">120+</div>
                <div className="text-xs text-gray-500">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">98%</div>
                <div className="text-xs text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm mt-auto">
        <p>© {new Date().getFullYear()} CommUnity. All rights reserved.</p>
      </footer>

      {/* Add animations and global styles - you would normally put these in your globals.css file */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}