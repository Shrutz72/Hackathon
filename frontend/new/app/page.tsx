"use client"
/*home page*/
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Building, Users, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 tracking-tight">
            Community Issue Reporting Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A centralized system for reporting and managing community issues, enhancing communication between residents
            and local government.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-4 rounded-full bg-blue-100">
                    <Building className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Government Portal</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Access the administrative dashboard to manage community issues, track progress, and coordinate
                    responses.
                  </p>
                  <Button
                    onClick={() => router.push("/government")}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    size="lg"
                  >
                    <span>Access Government Portal</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-4 rounded-full bg-green-100">
                    <Users className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Resident Portal</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Report community issues, track their progress, and collaborate with neighbors to improve your area.
                  </p>
                  <br></br>
                  <Button
                    onClick={() => router.push("/resident")}
                    className="bg-green-600 hover:bg-green-700 text-white mt-4"
                    size="lg"
                  >
                    <span>Access Resident Portal</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Report Issues</h3>
              <p className="text-gray-600">Submit community concerns with photos, location, and details</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Track Progress</h3>
              <p className="text-gray-600">Follow updates as government officials address your concerns</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Community Impact</h3>
              <p className="text-gray-600">See real changes in your neighborhood through collective action</p>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-12">
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-24 text-center text-gray-500 text-sm"
        >
          <footer>
          <p>© 2025 Community Issue Reporting Platform. All rights reserved.</p>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}

