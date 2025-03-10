"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import {
  Heart,
  Star,
  MessageCircle,
  Lightbulb,
  Wrench,
  HandHelping,
  Users,
  Home,
  Leaf,
  MapPin,
  Camera,
  Check,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample issue images
const ISSUE_IMAGES = [
  {
    id: 1,
    type: "pothole",
    image: "/placeholder.svg?height=150&width=150",
    title: "Road Damage",
    description: "Deep pothole causing traffic hazards",
    location: "Main Street",
    status: "resolved",
  },
  {
    id: 2,
    type: "trash",
    image: "/placeholder.svg?height=150&width=150",
    title: "Waste Pile-up",
    description: "Uncollected trash causing sanitation issues",
    location: "Community Park",
    status: "in-progress",
  },
  {
    id: 3,
    type: "power",
    image: "/placeholder.svg?height=150&width=150",
    title: "Power Outage",
    description: "Street lights not functioning",
    location: "Oak Avenue",
    status: "reported",
  },
  {
    id: 4,
    type: "water",
    image: "/placeholder.svg?height=150&width=150",
    title: "Water Leak",
    description: "Broken pipe causing water wastage",
    location: "Elm Street",
    status: "in-progress",
  },
]

export function CommunityAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeScene, setActiveScene] = useState("network")
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)
  const controls = useAnimation()

  const characters = [
    { id: 1, x: 20, y: 60, icon: <HandHelping className="h-6 w-6 text-purple-dark" />, color: "bg-purple-light" },
    { id: 2, x: 35, y: 40, icon: <Wrench className="h-6 w-6 text-blue-dark" />, color: "bg-blue-light" },
    { id: 3, x: 50, y: 70, icon: <Lightbulb className="h-6 w-6 text-yellow-500" />, color: "bg-yellow-100" },
    { id: 4, x: 65, y: 45, icon: <Leaf className="h-6 w-6 text-green-600" />, color: "bg-green-100" },
    { id: 5, x: 80, y: 65, icon: <Home className="h-6 w-6 text-orange-600" />, color: "bg-orange-100" },
  ]

  const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.2, transition: { duration: 0.3 } },
  }

  const lineVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
  }

  const messageVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 1 + custom * 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      },
    }),
  }

  const heartVariants = {
    initial: { scale: 0, opacity: 0, y: 10 },
    animate: (custom: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: 2 + custom * 0.1,
        duration: 0.5,
        type: "spring",
      },
    }),
  }

  const centerIconVariants = {
    initial: { scale: 0, opacity: 0, rotate: -30 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        delay: 0.5,
        duration: 0.7,
        type: "spring",
        stiffness: 100,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      boxShadow: [
        "0px 0px 0px rgba(167, 139, 250, 0.3)",
        "0px 0px 20px rgba(167, 139, 250, 0.7)",
        "0px 0px 0px rgba(167, 139, 250, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  }

  const issueCardVariants = {
    initial: { scale: 0.8, opacity: 0, y: 20 },
    animate: (custom: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 * custom,
        duration: 0.5,
        type: "spring",
      },
    }),
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  const statusColors = {
    reported: "bg-yellow-400",
    "in-progress": "bg-blue-400",
    resolved: "bg-green-500",
  }

  const statusLabels = {
    reported: "Reported",
    "in-progress": "In Progress",
    resolved: "Resolved",
  }

  useEffect(() => {
    // Reset animations when scene changes
    controls.start("animate")
  }, [activeScene, controls])

  const handleSceneChange = (scene: string) => {
    setActiveScene(scene)
    setSelectedIssue(null)
  }

  return (
    <div ref={containerRef} className="relative w-full h-[600px] overflow-hidden rounded-xl bg-gradient-mesh">
      {/* Scene Navigation */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
        <Button
          variant={activeScene === "network" ? "default" : "ghost"}
          size="sm"
          className={`rounded-full text-xs h-8 ${activeScene === "network" ? "bg-purple-blue-gradient" : "hover:bg-primary/10"}`}
          onClick={() => handleSceneChange("network")}
        >
          <Users className="h-4 w-4 mr-1" />
          Community Network
        </Button>
        <Button
          variant={activeScene === "issues" ? "default" : "ghost"}
          size="sm"
          className={`rounded-full text-xs h-8 ${activeScene === "issues" ? "bg-purple-blue-gradient" : "hover:bg-primary/10"}`}
          onClick={() => handleSceneChange("issues")}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Issue Reporting
        </Button>
        <Button
          variant={activeScene === "resolution" ? "default" : "ghost"}
          size="sm"
          className={`rounded-full text-xs h-8 ${activeScene === "resolution" ? "bg-purple-blue-gradient" : "hover:bg-primary/10"}`}
          onClick={() => handleSceneChange("resolution")}
        >
          <Check className="h-4 w-4 mr-1" />
          Problem Solving
        </Button>
      </div>

      {/* Community Network Scene */}
      <AnimatePresence>
        {activeScene === "network" && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Center community icon */}
            <motion.div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              variants={centerIconVariants}
              initial="initial"
              animate={["animate", "pulse"]}
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg">
                <Users className="h-10 w-10 text-gradient" />
              </div>
            </motion.div>

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {characters.map((char) => (
                <motion.path
                  key={`line-${char.id}`}
                  d={`M50,50 L${char.x},${char.y}`}
                  stroke="url(#lineGradient)"
                  strokeWidth="0.5"
                  fill="none"
                  variants={lineVariants}
                  initial="initial"
                  animate="animate"
                />
              ))}

              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
              </defs>
            </svg>

            {/* Character icons */}
            {characters.map((char) => (
              <motion.div
                key={`char-${char.id}`}
                className={`absolute z-20 ${char.color} p-3 rounded-full shadow-md`}
                style={{ left: `${char.x}%`, top: `${char.y}%`, transform: "translate(-50%, -50%)" }}
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                {char.icon}
              </motion.div>
            ))}

            {/* Message bubbles */}
            {[
              { id: 1, x: 30, y: 30, text: "I can help!" },
              { id: 2, x: 70, y: 30, text: "Great idea!" },
              { id: 3, x: 25, y: 75, text: "Let's collaborate" },
              { id: 4, x: 75, y: 75, text: "Count me in!" },
            ].map((message, index) => (
              <motion.div
                key={`message-${message.id}`}
                className="absolute z-30 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-medium"
                style={{ left: `${message.x}%`, top: `${message.y}%` }}
                variants={messageVariants}
                custom={index}
                initial="initial"
                animate="animate"
              >
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-primary" />
                  <span>{message.text}</span>
                </div>
              </motion.div>
            ))}

            {/* Floating hearts and stars */}
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={`heart-${index}`}
                className="absolute z-20"
                style={{
                  left: `${20 + index * 10}%`,
                  top: `${Math.random() * 20 + 10}%`,
                }}
                variants={heartVariants}
                custom={index}
                initial="initial"
                animate="animate"
              >
                {index % 2 === 0 ? (
                  <Heart className="h-4 w-4 text-pink-500 animate-float" />
                ) : (
                  <Star className="h-4 w-4 text-yellow-500 animate-float" />
                )}
              </motion.div>
            ))}

            {/* Animated text at the bottom */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <motion.h3
                className="text-xl font-bold text-gradient"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.7 }}
              >
                Together We Build Stronger Communities
              </motion.h3>
              <motion.p
                className="text-sm text-gray-700 mt-2 max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.7 }}
              >
                Connecting neighbors to solve local issues and create lasting positive change
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Issue Reporting Scene */}
        {activeScene === "issues" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="text-xl font-bold text-gradient mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Report and Track Community Issues
            </motion.h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
              {ISSUE_IMAGES.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  variants={issueCardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={index}
                  whileHover="hover"
                  onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                >
                  <div className="relative">
                    <img
                      src={issue.image || "/placeholder.svg"}
                      alt={issue.title}
                      className="w-full h-32 object-cover"
                    />
                    <div
                      className={`absolute top-2 right-2 ${statusColors[issue.status as keyof typeof statusColors]} text-white text-xs px-2 py-0.5 rounded-full`}
                    >
                      {statusLabels[issue.status as keyof typeof statusLabels]}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{issue.location}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedIssue === issue.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm p-3 flex flex-col"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <h4 className="font-medium text-sm">{issue.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                        <div className="flex items-center mt-2 text-xs">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          <span>{issue.location}</span>
                        </div>
                        <div className="mt-auto pt-2 flex justify-between items-center">
                          <span
                            className={`text-xs ${statusColors[issue.status as keyof typeof statusColors]} text-white px-2 py-0.5 rounded-full`}
                          >
                            {statusLabels[issue.status as keyof typeof statusLabels]}
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs p-0">
                            <Camera className="h-3 w-3 mr-1" />
                            View Photos
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h4 className="font-medium text-center">Report a New Issue</h4>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Button size="sm" className="text-xs bg-purple-blue-gradient hover:opacity-90">
                  <Camera className="h-3 w-3 mr-1" />
                  Take Photo
                </Button>
                <Button size="sm" className="text-xs bg-blue-purple-gradient hover:opacity-90">
                  <MapPin className="h-3 w-3 mr-1" />
                  Mark Location
                </Button>
                <Button size="sm" className="text-xs bg-purple-blue-gradient hover:opacity-90">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Add Details
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Problem Solving Scene */}
        {activeScene === "resolution" && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[80%] h-[70%]">
                {/* Before/After Comparison */}
                <motion.div
                  className="absolute left-0 top-0 w-1/2 h-full bg-white rounded-l-lg shadow-md overflow-hidden"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-full flex flex-col">
                    <div className="bg-red-100 p-3 text-center">
                      <h4 className="font-medium text-red-800">Before</h4>
                    </div>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="Before"
                        className="w-40 h-40 object-cover rounded-md mb-4"
                      />
                      <div className="space-y-2 text-center">
                        <p className="text-sm font-medium">Reported Issue</p>
                        <p className="text-xs text-muted-foreground">Broken street light causing safety concerns</p>
                        <div className="flex items-center justify-center text-xs text-yellow-600 bg-yellow-100 rounded-full px-2 py-0.5 w-max mx-auto">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Unresolved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-0 top-0 w-1/2 h-full bg-white rounded-r-lg shadow-md overflow-hidden"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="h-full flex flex-col">
                    <div className="bg-green-100 p-3 text-center">
                      <h4 className="font-medium text-green-800">After</h4>
                    </div>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="After"
                        className="w-40 h-40 object-cover rounded-md mb-4"
                      />
                      <div className="space-y-2 text-center">
                        <p className="text-sm font-medium">Community Solution</p>
                        <p className="text-xs text-muted-foreground">
                          Repaired and upgraded to energy-efficient LED lighting
                        </p>
                        <div className="flex items-center justify-center text-xs text-green-600 bg-green-100 rounded-full px-2 py-0.5 w-max mx-auto">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Resolved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Center connector */}
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    delay: 0.4,
                    duration: 0.5,
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                      transition: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                    }}
                  >
                    <div className="bg-purple-blue-gradient text-white rounded-full p-3">
                      <Wrench className="h-6 w-6" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="absolute bottom-8 left-0 right-0">
              <motion.div
                className="flex justify-center gap-4 mx-auto max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {[
                  { icon: <AlertTriangle className="h-4 w-4" />, text: "Report" },
                  { icon: <Users className="h-4 w-4" />, text: "Collaborate" },
                  { icon: <Wrench className="h-4 w-4" />, text: "Solve" },
                  { icon: <Check className="h-4 w-4" />, text: "Verify" },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                        {step.icon}
                      </div>
                      {index < 3 && (
                        <motion.div
                          className="absolute top-1/2 left-full w-8 h-0.5 bg-gray-300"
                          style={{ transformOrigin: "left" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        />
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium">{step.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

