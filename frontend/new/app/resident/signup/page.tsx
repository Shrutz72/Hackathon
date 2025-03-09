// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import { Users, ArrowLeft } from "lucide-react"

// export default function ResidentSignup() {
//   const router = useRouter()
//   const [name, setName] = useState("")
//   const [email, setEmail] = useState("")
//   const [phone, setPhone] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleSignup = (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     // Basic validation
//     if (password !== confirmPassword) {
//       setError("Passwords do not match")
//       setIsLoading(false)
//       return
//     }

//     // Simulate signup process
//     setTimeout(() => {
//       // For demo purposes, let's use a simple validation
//       if (name && email && password) {
//         // Store login state in localStorage or use a more robust state management solution
//         localStorage.setItem("residentLoggedIn", "true")
//         // Redirect to dashboard
//         router.push("/resident/dashboard")
//       } else {
//         setError("Please fill in all required fields")
//       }
//       setIsLoading(false)
//     }, 1000)
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Simple header with back button */}
//       <header className="bg-white border-b shadow-sm">
//         <div className="container mx-auto px-4">
//           <div className="flex h-16 items-center">
//             <Link href="/resident">
//               <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to Login
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-16 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//           <div className="flex justify-center mb-6">
//             <div className="p-3 rounded-full bg-green-100">
//               <Users className="h-8 w-8 text-green-600" />
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Resident Account</h2>

//           {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

//           {/* Signup Form */}
//           <form onSubmit={handleSignup} className="space-y-4">
//             <Input
//               type="text"
//               placeholder="Full Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//             <Input
//               type="email"
//               placeholder="Email Address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
            
//             <Input
//               type="tel"
//               placeholder="Phone Number (Optional)"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//             <Input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <Input
//               type="password"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//             <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
//               {isLoading ? "Creating Account..." : "Sign Up"}
//             </Button>
//           </form>

//           {/* Login Link */}
//           <div className="mt-4 text-center text-gray-600">
//             Already have an account?{" "}
//             <Link href="/resident" className="text-green-600 hover:underline">
//               Log in
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for states and cities in India
const STATES = [
  { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
  { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"] },
  { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"] },
  { name: "Delhi", cities: ["New Delhi"] },
  { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur"] },
]

export default function ResidentSignup() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")

  const handleSignup = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!selectedState || !selectedCity) {
      setError("Please select your state and city")
      setIsLoading(false)
      return
    }

    // Simulate signup process
    setTimeout(() => {
      // For demo purposes, let's use a simple validation
      if (name && email && password) {
        // Store login state in localStorage or use a more robust state management solution
        localStorage.setItem("residentLoggedIn", "true")
        // Redirect to dashboard
        router.push("/resident/dashboard")
      } else {
        setError("Please fill in all required fields")
      }
      setIsLoading(false)
    }, 1000)
  }

  // Get cities for the selected state
  const citiesForSelectedState = STATES.find((state) => state.name === selectedState)?.cities || []

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header with back button */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/resident">
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
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Resident Account</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* State Dropdown */}
            <Select onValueChange={setSelectedState} required>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state.name} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Dropdown */}
            <Select onValueChange={setSelectedCity} required disabled={!selectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {citiesForSelectedState.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/resident" className="text-green-600 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

