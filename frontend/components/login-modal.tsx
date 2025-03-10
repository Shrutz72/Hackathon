"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, User, Lock, Mail, Building, X } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [userType, setUserType] = useState<"citizen" | "government">("citizen")

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.3 },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 * custom,
        duration: 0.3,
      },
    }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-20 bg-purple-blue-gradient" />

              <div className="relative pt-12 px-6 pb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>

                <div className="flex justify-center -mt-10 mb-6">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    {userType === "citizen" ? (
                      <Users className="h-8 w-8 text-primary" />
                    ) : (
                      <Shield className="h-8 w-8 text-primary" />
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6">
                  {userType === "citizen" ? "Community Login" : "Government Official Login"}
                </h2>

                <Tabs
                  defaultValue="citizen"
                  className="w-full"
                  onValueChange={(value) => setUserType(value as "citizen" | "government")}
                >
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger
                      value="citizen"
                      className="data-[state=active]:bg-purple-blue-gradient data-[state=active]:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Citizen
                    </TabsTrigger>
                    <TabsTrigger
                      value="government"
                      className="data-[state=active]:bg-purple-blue-gradient data-[state=active]:text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Government
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="citizen" className="space-y-4 mt-0">
                    <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                      <div className="space-y-2">
                        <Label htmlFor="citizen-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="citizen-email"
                            type="email"
                            className="pl-9"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={2} initial="hidden" animate="visible">
                      <div className="space-y-2">
                        <Label htmlFor="citizen-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="citizen-password" type="password" className="pl-9" placeholder="••••••••" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={3} initial="hidden" animate="visible">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="remember" className="rounded border-gray-300" />
                          <label htmlFor="remember">Remember me</label>
                        </div>
                        <a href="#" className="text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={4} initial="hidden" animate="visible">
                      <Button className="w-full bg-purple-blue-gradient hover:opacity-90">Sign In</Button>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={5} initial="hidden" animate="visible">
                      <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account?</span>{" "}
                        <a href="#" className="text-primary hover:underline">
                          Sign up
                        </a>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="government" className="space-y-4 mt-0">
                    <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                      <div className="space-y-2">
                        <Label htmlFor="gov-id">Government ID</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="gov-id" className="pl-9" placeholder="GOV-12345" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={2} initial="hidden" animate="visible">
                      <div className="space-y-2">
                        <Label htmlFor="gov-department">Department</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="gov-department" className="pl-9" placeholder="Public Works" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={3} initial="hidden" animate="visible">
                      <div className="space-y-2">
                        <Label htmlFor="gov-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="gov-password" type="password" className="pl-9" placeholder="••••••••" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={4} initial="hidden" animate="visible">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="secure" className="rounded border-gray-300" />
                          <label htmlFor="secure">This is a secure device</label>
                        </div>
                        <a href="#" className="text-primary hover:underline">
                          Need help?
                        </a>
                      </div>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={5} initial="hidden" animate="visible">
                      <Button className="w-full bg-purple-blue-gradient hover:opacity-90">Secure Login</Button>
                    </motion.div>

                    <motion.div variants={inputVariants} custom={6} initial="hidden" animate="visible">
                      <div className="text-center text-sm text-muted-foreground">
                        Government access is restricted to authorized personnel only
                      </div>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

