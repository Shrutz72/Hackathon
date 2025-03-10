"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Search, Plus, Minus, AlertTriangle, Trash2, Droplets, Zap, Construction } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Mock community data with issue types
const COMMUNITIES = [
  {
    id: 1,
    name: "Tech Enthusiasts",
    members: 1243,
    events: 12,
    x: 30,
    y: 40,
    issueType: "power",
    issueCount: 3,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 2,
    name: "Outdoor Adventures",
    members: 876,
    events: 8,
    x: 70,
    y: 30,
    issueType: "road",
    issueCount: 7,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 3,
    name: "Book Club",
    members: 532,
    events: 4,
    x: 50,
    y: 60,
    issueType: "waste",
    issueCount: 2,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 4,
    name: "Foodies Unite",
    members: 1567,
    events: 15,
    x: 20,
    y: 70,
    issueType: "water",
    issueCount: 5,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 5,
    name: "Fitness Group",
    members: 982,
    events: 20,
    x: 80,
    y: 50,
    issueType: "general",
    issueCount: 1,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 6,
    name: "Art Collective",
    members: 421,
    events: 6,
    x: 40,
    y: 20,
    issueType: "road",
    issueCount: 4,
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 7,
    name: "Music Lovers",
    members: 753,
    events: 9,
    x: 60,
    y: 80,
    issueType: "power",
    issueCount: 2,
    image: "/placeholder.svg?height=120&width=120",
  },
]

// Sample issue images
const ISSUE_IMAGES = {
  power: "/placeholder.svg?height=200&width=300",
  road: "/placeholder.svg?height=200&width=300",
  waste: "/placeholder.svg?height=200&width=300",
  water: "/placeholder.svg?height=200&width=300",
  general: "/placeholder.svg?height=200&width=300",
}

// Issue type icons and colors
const ISSUE_TYPES = {
  power: { icon: <Zap className="h-4 w-4" />, color: "bg-yellow-400", name: "Power Outage" },
  road: { icon: <Construction className="h-4 w-4" />, color: "bg-orange-400", name: "Road Issue" },
  waste: { icon: <Trash2 className="h-4 w-4" />, color: "bg-green-400", name: "Waste Management" },
  water: { icon: <Droplets className="h-4 w-4" />, color: "bg-blue-400", name: "Water Issue" },
  general: { icon: <AlertTriangle className="h-4 w-4" />, color: "bg-red-400", name: "General Issue" },
}

export function CommunityMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null)
  const [hoveredCommunity, setHoveredCommunity] = useState<number | null>(null)
  const [mapMode, setMapMode] = useState<"communities" | "issues">("communities")
  const [filter, setFilter] = useState<string | null>(null)
  const [showIssueDetail, setShowIssueDetail] = useState(false)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6))
  }

  const handleStartDrag = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartDragPosition({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y })
  }

  const handleDrag = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapPosition({
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y,
      })
    }
  }

  const handleEndDrag = () => {
    setIsDragging(false)
  }

  const toggleMapMode = () => {
    setMapMode((prev) => (prev === "communities" ? "issues" : "communities"))
    setSelectedCommunity(null)
    setHoveredCommunity(null)
    setShowIssueDetail(false)
  }

  const filterByIssueType = (type: string | null) => {
    setFilter(type)
    setSelectedCommunity(null)
    setHoveredCommunity(null)
  }

  const getIssueIcon = (type: string) => {
    return ISSUE_TYPES[type as keyof typeof ISSUE_TYPES]?.icon || <AlertTriangle className="h-4 w-4" />
  }

  const getIssueColor = (type: string) => {
    return ISSUE_TYPES[type as keyof typeof ISSUE_TYPES]?.color || "bg-gray-400"
  }

  const getIssueName = (type: string) => {
    return ISSUE_TYPES[type as keyof typeof ISSUE_TYPES]?.name || "Issue"
  }

  const getIssueImage = (type: string) => {
    return ISSUE_IMAGES[type as keyof typeof ISSUE_IMAGES] || ISSUE_IMAGES.general
  }

  return (
    <div className="relative w-full h-full bg-muted/30 rounded-xl overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-background/90 rounded-md p-2 shadow-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search communities..."
          className="bg-transparent border-none text-sm focus:outline-none w-40"
        />
      </div>

      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/90 shadow-md hover:bg-primary/20 hover:text-primary transition-colors"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Zoom in</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/90 shadow-md hover:bg-primary/20 hover:text-primary transition-colors"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Zoom out</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-background/90 shadow-md hover:bg-primary/20 hover:text-primary transition-colors text-xs"
          onClick={toggleMapMode}
        >
          {mapMode === "communities" ? "Show Issues" : "Show Communities"}
        </Button>
      </div>

      {/* Issue Type Filters */}
      {mapMode === "issues" && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 bg-background/90 rounded-md p-2 shadow-md">
          <Button
            variant={filter === null ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => filterByIssueType(null)}
          >
            All
          </Button>
          {Object.entries(ISSUE_TYPES).map(([type, data]) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 px-2 flex items-center gap-1 ${filter === type ? "bg-primary" : ""}`}
              onClick={() => filterByIssueType(type)}
            >
              <span className={`w-2 h-2 rounded-full ${data.color}`}></span>
              {data.name}
            </Button>
          ))}
        </div>
      )}

      <div
        ref={mapRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: "url('/placeholder.svg?height=800&width=800')",
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: "center",
        }}
        onMouseDown={handleStartDrag}
        onMouseMove={handleDrag}
        onMouseUp={handleEndDrag}
        onMouseLeave={handleEndDrag}
      >
        <motion.div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${mapPosition.x / zoom}px, ${mapPosition.y / zoom}px)`,
            transformOrigin: "center",
          }}
        >
          {/* Map Content */}
          {mapMode === "communities"
            ? // Communities View
              COMMUNITIES.map((community) => (
                <motion.div
                  key={community.id}
                  className={`absolute cursor-pointer z-10`}
                  style={{
                    left: `${community.x}%`,
                    top: `${community.y}%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    zIndex: selectedCommunity === community.id ? 30 : 10,
                  }}
                  transition={{ type: "spring", duration: 0.5 }}
                  onClick={() => setSelectedCommunity(selectedCommunity === community.id ? null : community.id)}
                  onMouseEnter={() => setHoveredCommunity(community.id)}
                  onMouseLeave={() => setHoveredCommunity(null)}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className={`
                    flex items-center justify-center rounded-full shadow-lg
                    ${
                      selectedCommunity === community.id
                        ? "bg-primary text-primary-foreground h-12 w-12"
                        : "bg-background text-foreground h-10 w-10"
                    }
                  `}
                    animate={{
                      y: [0, -5, 0],
                      boxShadow:
                        selectedCommunity === community.id
                          ? "0 0 15px rgba(167, 139, 250, 0.7)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    transition={{
                      y: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
                      boxShadow: { duration: 0.3 },
                    }}
                  >
                    <Users className="h-5 w-5" />
                  </motion.div>

                  <AnimatePresence>
                    {(selectedCommunity === community.id || hoveredCommunity === community.id) && (
                      <motion.div
                        className="absolute top-full left-1/2 mt-2 bg-background rounded-lg shadow-lg p-3 w-64 z-30"
                        initial={{ opacity: 0, y: -10, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{community.name}</h4>
                            <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{community.members.toLocaleString()} members</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{community.events} upcoming events</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedCommunity === community.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Active Issues</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {community.issueCount}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                {getIssueIcon(community.issueType)}
                                <span className="text-xs">{getIssueName(community.issueType)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="w-full text-xs h-7 bg-purple-blue-gradient hover:opacity-90">
                                View Community
                              </Button>
                              <Button size="sm" variant="outline" className="w-full text-xs h-7">
                                Join
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            : // Issues View
              COMMUNITIES.filter((c) => filter === null || c.issueType === filter).map((community) => (
                <motion.div
                  key={`issue-${community.id}`}
                  className="absolute cursor-pointer z-10"
                  style={{
                    left: `${community.x}%`,
                    top: `${community.y}%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  onClick={() => {
                    setSelectedCommunity(community.id)
                    setShowIssueDetail(true)
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className={`
                    flex items-center justify-center rounded-full shadow-lg
                    ${getIssueColor(community.issueType)} text-white h-10 w-10
                  `}
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                    }}
                    transition={{
                      scale: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
                      boxShadow: { duration: 0.3 },
                    }}
                  >
                    {getIssueIcon(community.issueType)}
                  </motion.div>

                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs font-medium shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getIssueName(community.issueType)}
                  </motion.div>
                </motion.div>
              ))}

          {/* Issue Detail Modal */}
          <AnimatePresence>
            {showIssueDetail && selectedCommunity && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowIssueDetail(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(() => {
                    const community = COMMUNITIES.find((c) => c.id === selectedCommunity)
                    if (!community) return null

                    return (
                      <>
                        <div className="relative">
                          <img
                            src={getIssueImage(community.issueType) || "/placeholder.svg"}
                            alt={getIssueName(community.issueType)}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                              onClick={() => setShowIssueDetail(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                              <span className="sr-only">Close</span>
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${getIssueColor(community.issueType)} flex items-center justify-center`}
                              >
                                {getIssueIcon(community.issueType)}
                              </div>
                              <h3 className="text-white font-bold">{getIssueName(community.issueType)}</h3>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{community.name} Area</h4>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              In Progress
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Reported 2 days ago by local residents. This issue affects approximately 150 households in
                            the area.
                          </p>

                          <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">Status Updates</span>
                              <span className="text-xs text-muted-foreground">Last updated: 6 hours ago</span>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                              <p className="font-medium">Maintenance Team</p>
                              <p className="text-muted-foreground mt-1">
                                Our team is aware of the issue and has scheduled repairs for tomorrow morning. We
                                appreciate your patience.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t flex justify-between">
                            <Button variant="outline" size="sm" className="text-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              Add Comment
                            </Button>
                            <Button size="sm" className="text-xs bg-purple-blue-gradient hover:opacity-90">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" x2="4" y1="22" y2="15" />
                              </svg>
                              Follow Issue
                            </Button>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

