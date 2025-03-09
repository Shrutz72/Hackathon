// "use client"
// //what will be visible on resident page
// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import Link from "next/link"
// import Image from "next/image"
// import {
//   CheckCircle2,
//   Clock,
//   AlertTriangle,
//   PlusCircle,
//   ArrowLeft,
//   RefreshCw,
//   Search,
//   Filter,
//   MapPin,
//   MessageSquare,
//   ThumbsUp,
//   Eye,
//   Bell,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import dynamic from "next/dynamic"

// // Import Map component with no SSR and error handling
// const MapWithNoSSR = dynamic(
//   () =>
//     import("@/components/Map").catch((err) => {
//       console.error("Error loading Map component:", err)
//       return () => (
//         <div className="h-full w-full flex items-center justify-center bg-gray-100">
//           <div className="text-red-500">Failed to load map. Please refresh the page.</div>
//         </div>
//       )
//     }),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-full w-full flex items-center justify-center bg-gray-100">
//         <div className="text-gray-500">Loading map...</div>
//       </div>
//     ),
//   },
// )

// // Updated mock data with Chennai locations
// const MOCK_ISSUES = [
//   {
//     id: 1,
//     title: "Pothole on Anna Salai",
//     description:
//       "Large pothole near the intersection of Anna Salai and Mount Road that poses a hazard to vehicles and cyclists.",
//     category: "Roads",
//     location: "Anna Salai, Chennai",
//     coordinates: { lat: 13.0569, lng: 80.2425 },
//     status: "in-progress",
//     date: "2023-11-15",
//     upvotes: 24,
//     comments: 8,
//     image: "/placeholder.svg?height=200&width=300",
//     updates: [
//       { date: "2023-11-16", note: "Issue received and assigned to Roads Department" },
//       { date: "2023-11-18", note: "Scheduled for repair next week" },
//     ],
//   },
//   {
//     id: 2,
//     title: "Streetlight not working",
//     description: "Streetlight has been out for 3 days, creating a safety concern for pedestrians at night.",
//     category: "Utilities",
//     location: "T. Nagar, Chennai",
//     coordinates: { lat: 13.0418, lng: 80.2341 },
//     status: "pending",
//     date: "2023-11-17",
//     upvotes: 12,
//     comments: 3,
//     image: "/placeholder.svg?height=200&width=300",
//     updates: [{ date: "2023-11-17", note: "Issue received and under review" }],
//   },
//   {
//     id: 3,
//     title: "Fallen tree blocking sidewalk",
//     description: "Tree fell during last night's storm and is completely blocking the pedestrian walkway.",
//     category: "Parks",
//     location: "Adyar, Chennai",
//     coordinates: { lat: 13.0012, lng: 80.2565 },
//     status: "resolved",
//     date: "2023-11-10",
//     upvotes: 32,
//     comments: 15,
//     image: "/placeholder.svg?height=200&width=300",
//     updates: [
//       { date: "2023-11-10", note: "Issue received and assigned to Parks Department" },
//       { date: "2023-11-11", note: "Crew dispatched to remove tree" },
//       { date: "2023-11-12", note: "Tree removed and sidewalk cleared" },
//     ],
//   },
//   {
//     id: 4,
//     title: "Graffiti on community center",
//     description: "Inappropriate graffiti on the west wall of the community center needs to be removed.",
//     category: "Public Facilities",
//     location: "Mylapore, Chennai",
//     coordinates: { lat: 13.0368, lng: 80.2676 },
//     status: "in-progress",
//     date: "2023-11-14",
//     upvotes: 18,
//     comments: 6,
//     image: "/placeholder.svg?height=200&width=300",
//     updates: [
//       { date: "2023-11-14", note: "Issue received and assigned to Maintenance Department" },
//       { date: "2023-11-16", note: "Cleanup scheduled for next week" },
//     ],
//   },
//   {
//     id: 5,
//     title: "Broken playground equipment",
//     description: "The swing set at Marina Beach Park has a broken chain that could be dangerous for children.",
//     category: "Parks",
//     location: "Marina Beach, Chennai",
//     coordinates: { lat: 13.0499, lng: 80.2824 },
//     status: "pending",
//     date: "2023-11-18",
//     upvotes: 27,
//     comments: 9,
//     image: "/placeholder.svg?height=200&width=300",
//     updates: [{ date: "2023-11-18", note: "Issue received and under review" }],
//   },
// ]

// export default function ResidentPage() {
//   const [issues, setIssues] = useState([])
//   const [activeTab, setActiveTab] = useState("all")
//   const [searchQuery, setSearchQuery] = useState("")
//   const [categoryFilter, setCategoryFilter] = useState("all")
//   const [isRefreshing, setIsRefreshing] = useState(false)
//   const [selectedIssue, setSelectedIssue] = useState(null)
//   const [mounted, setMounted] = useState(false)
//   const [mapError, setMapError] = useState(false)

//   useEffect(() => {
//     setMounted(true)

//     // Initialize with mock data
//     setIssues(MOCK_ISSUES)

//     // Try to load issues from localStorage if available
//     try {
//       const savedIssues = localStorage.getItem("reportedIssues")
//       if (savedIssues) {
//         const parsedIssues = JSON.parse(savedIssues)
//         setIssues([...MOCK_ISSUES, ...parsedIssues])
//       }
//     } catch (e) {
//       console.error("Error loading saved issues:", e)
//     }
//   }, [])

//   const refreshData = () => {
//     setIsRefreshing(true)

//     // Try to reload issues from localStorage
//     try {
//       const savedIssues = localStorage.getItem("reportedIssues")
//       if (savedIssues) {
//         const parsedIssues = JSON.parse(savedIssues)
//         setIssues([...MOCK_ISSUES, ...parsedIssues])
//       } else {
//         setIssues(MOCK_ISSUES)
//       }
//     } catch (e) {
//       console.error("Error loading saved issues:", e)
//       setIssues(MOCK_ISSUES)
//     }

//     setTimeout(() => {
//       setIsRefreshing(false)
//     }, 1000)
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "resolved":
//         return <CheckCircle2 className="h-5 w-5 text-green-500" />
//       case "in-progress":
//         return <Clock className="h-5 w-5 text-blue-500" />
//       default:
//         return <AlertTriangle className="h-5 w-5 text-amber-500" />
//     }
//   }

//   const getStatusText = (status) => {
//     switch (status) {
//       case "resolved":
//         return "Resolved"
//       case "in-progress":
//         return "In Progress"
//       default:
//         return "Pending"
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "resolved":
//         return "bg-green-100 text-green-800 border-green-300"
//       case "in-progress":
//         return "bg-blue-100 text-blue-800 border-blue-300"
//       default:
//         return "bg-amber-100 text-amber-800 border-amber-300"
//     }
//   }

//   const filteredIssues = issues.filter((issue) => {
//     if (activeTab !== "all" && issue.status !== activeTab) return false
//     if (
//       searchQuery &&
//       !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
//       !issue.description.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//       return false
//     if (categoryFilter !== "all" && issue.category !== categoryFilter) return false
//     return true
//   })

//   if (!mounted) return null

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Navigation Bar */}
//       <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
//         <div className="container mx-auto px-4">
//           <div className="flex h-16 items-center justify-between">
//             {/* Back Button and Page Title */}
//             <div className="flex items-center">
//               <Link href="/">
//                 <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Back To Home
//                 </Button>
//               </Link>
//             </div>

//             {/* Dashboard Link and Notification Bell */}
//             <div className="flex items-center space-x-4">
//               {/* Dashboard Link */}
//               <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600">
//                 <Button variant="ghost" className="flex items-center gap-2">
//                   Dashboard
//                 </Button>
//               </Link>

//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Community Dashboard</h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">Track community issues and be part of the solution</p>
//         </div>

//         <div className="mb-8 bg-white rounded-xl p-4 shadow-md">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//               <Input
//                 placeholder="Search issues..."
//                 className="pl-10"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter className="h-4 w-4 text-gray-400" />
//               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   <SelectItem value="Roads">Roads</SelectItem>
//                   <SelectItem value="Utilities">Utilities</SelectItem>
//                   <SelectItem value="Parks">Parks</SelectItem>
//                   <SelectItem value="Public Facilities">Public Facilities</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
//               <TabsList className="grid grid-cols-3 w-full">
//                 <TabsTrigger value="all">All Issues</TabsTrigger>
//                 <TabsTrigger value="pending">Pending</TabsTrigger>
//                 <TabsTrigger value="in-progress">In Progress</TabsTrigger>
//               </TabsList>
//             </Tabs>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <AnimatePresence>
//               {filteredIssues.length === 0 ? (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="bg-white rounded-lg p-8 text-center shadow-md"
//                 >
//                   <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
//                   <h3 className="text-xl font-medium text-gray-800 mb-2">No Issues Found</h3>
//                   <p className="text-gray-600">Try adjusting your filters or search criteria</p>
//                 </motion.div>
//               ) : (
//                 filteredIssues.map((issue) => (
//                   <motion.div
//                     key={issue.id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.3 }}
//                     layout
//                   >
//                     <Card className="overflow-hidden border shadow-md bg-white">
//                       <CardContent className="p-0">
//                         <div className="relative">
//                           <Image
//                             src={issue.image || "/placeholder.svg"}
//                             alt={issue.title}
//                             width={400}
//                             height={200}
//                             className="w-full h-48 object-cover"
//                           />
//                           <Badge className={`${getStatusColor(issue.status)} absolute top-3 right-3`}>
//                             {getStatusIcon(issue.status)}
//                             <span className="ml-1">{getStatusText(issue.status)}</span>
//                           </Badge>
//                         </div>
//                         <div className="p-4">
//                           <h3 className="text-xl font-bold text-gray-800 mb-2">{issue.title}</h3>
//                           <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>
//                           <div className="flex items-center justify-between text-sm text-gray-500">
//                             <div className="flex items-center">
//                               <MapPin className="h-4 w-4 mr-1" />
//                               {issue.location}
//                             </div>
//                             <div>Reported on {new Date(issue.date).toLocaleDateString()}</div>
//                           </div>
//                         </div>
//                       </CardContent>
//                       <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between">
//                         <div className="flex gap-3">
//                           <Button variant="ghost" size="sm" className="text-gray-600">
//                             <ThumbsUp className="h-4 w-4 mr-1" />
//                             {issue.upvotes}
//                           </Button>
//                           <Button variant="ghost" size="sm" className="text-gray-600">
//                             <MessageSquare className="h-4 w-4 mr-1" />
//                             {issue.comments}
//                           </Button>
//                         </div>
//                         <Button size="sm" variant="outline" onClick={() => setSelectedIssue(issue)}>
//                           <Eye className="h-4 w-4 mr-1" />
//                           View Details
//                         </Button>
//                       </CardFooter>
//                     </Card>
//                   </motion.div>
//                 ))
//               )}
//             </AnimatePresence>
//           </div>

//           <div className="sticky top-8 h-[calc(100vh-6rem)]">
//             <Card className="h-full overflow-hidden">
//               <CardHeader>
//                 <CardTitle>Issue Locations</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0 h-[calc(100%-4rem)] relative">
//                 {mapError ? (
//                   <div className="h-full w-full flex items-center justify-center bg-gray-100">
//                     <div className="text-red-500 text-center p-4">
//                       <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
//                       <p>Failed to load map. Please refresh the page.</p>
//                       <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
//                         Refresh Page
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <MapWithNoSSR
//                     issues={filteredIssues}
//                     selectedIssue={selectedIssue}
//                     onMarkerClick={setSelectedIssue}
//                     center={[13.0827, 80.2707]} // Chennai coordinates
//                   />
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Fixed Report Issue Button */}
//       <div className="fixed bottom-8 right-8 z-20">
//         <Link href="/resident/report">
//           <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
//             <PlusCircle className="mr-2 h-5 w-5" />
//             Report an Issue
//           </Button>
//         </Link>
//       </div>
//     </div>
//   )
// }

// //CSS

"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Eye,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Import Map component with no SSR and error handling
const MapWithNoSSR = dynamic(
  () =>
    import("@/components/Map").catch((err) => {
      console.error("Error loading Map component:", err)
      return () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-red-500">Failed to load map. Please refresh the page.</div>
        </div>
      )
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center text-indigo-500">
          <RefreshCw className="h-8 w-8 animate-spin mb-2" />
          <span className="font-medium">Loading map...</span>
        </div>
      </div>
    ),
  },
)

// Updated mock data with Chennai locations and new category
const MOCK_ISSUES = [
  {
    id: 1,
    title: "Pothole on Anna Salai",
    description:
      "Large pothole near the intersection of Anna Salai and Mount Road that poses a hazard to vehicles and cyclists.",
    category: "Roads",
    location: "Anna Salai, Chennai",
    coordinates: { lat: 13.0569, lng: 80.2425 },
    status: "in-progress",
    date: "2023-11-15",
    upvotes: 24,
    comments: 8,
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-16", note: "Issue received and assigned to Roads Department" },
      { date: "2023-11-18", note: "Scheduled for repair next week" },
    ],
  },
  {
    id: 2,
    title: "Streetlight not working",
    description: "Streetlight has been out for 3 days, creating a safety concern for pedestrians at night.",
    category: "Utilities",
    location: "T. Nagar, Chennai",
    coordinates: { lat: 13.0418, lng: 80.2341 },
    status: "pending",
    date: "2023-11-17",
    upvotes: 12,
    comments: 3,
    image: "/placeholder.svg?height=200&width=300",
    updates: [{ date: "2023-11-17", note: "Issue received and under review" }],
  },
  {
    id: 3,
    title: "Fallen tree blocking sidewalk",
    description: "Tree fell during last night's storm and is completely blocking the pedestrian walkway.",
    category: "Parks",
    location: "Adyar, Chennai",
    coordinates: { lat: 13.0012, lng: 80.2565 },
    status: "resolved",
    date: "2023-11-10",
    upvotes: 32,
    comments: 15,
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-10", note: "Issue received and assigned to Parks Department" },
      { date: "2023-11-11", note: "Crew dispatched to remove tree" },
      { date: "2023-11-12", note: "Tree removed and sidewalk cleared" },
    ],
  },
  {
    id: 4,
    title: "Graffiti on community center",
    description: "Inappropriate graffiti on the west wall of the community center needs to be removed.",
    category: "Public Facilities",
    location: "Mylapore, Chennai",
    coordinates: { lat: 13.0368, lng: 80.2676 },
    status: "in-progress",
    date: "2023-11-14",
    upvotes: 18,
    comments: 6,
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-14", note: "Issue received and assigned to Maintenance Department" },
      { date: "2023-11-16", note: "Cleanup scheduled for next week" },
    ],
  },
  {
    id: 5,
    title: "Broken playground equipment",
    description: "The swing set at Marina Beach Park has a broken chain that could be dangerous for children.",
    category: "Parks",
    location: "Marina Beach, Chennai",
    coordinates: { lat: 13.0499, lng: 80.2824 },
    status: "pending",
    date: "2023-11-18",
    upvotes: 27,
    comments: 9,
    image: "/placeholder.svg?height=200&width=300",
    updates: [{ date: "2023-11-18", note: "Issue received and under review" }],
  },
  {
    id: 6,
    title: "Garbage overflow near market",
    description: "Garbage bins are overflowing near the local market causing bad odor and health concerns.",
    category: "Cleanliness",
    location: "Velachery, Chennai",
    coordinates: { lat: 13.0323, lng: 80.2177 },
    status: "pending",
    date: "2023-11-19",
    upvotes: 42,
    comments: 14,
    image: "/placeholder.svg?height=200&width=300",
    updates: [{ date: "2023-11-19", note: "Issue reported to Sanitation Department" }],
  },
  {
    id: 7,
    title: "Water leakage in public fountain",
    description: "Water is leaking from the main pipe of the public fountain, causing water wastage.",
    category: "Miscellaneous",
    location: "Egmore, Chennai",
    coordinates: { lat: 13.0732, lng: 80.2609 },
    status: "in-progress",
    date: "2023-11-16",
    upvotes: 15,
    comments: 5,
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-16", note: "Issue received and assessment scheduled" },
      { date: "2023-11-17", note: "Team dispatched to fix the leakage" },
    ],
  },
]

export default function ResidentPage() {
  const [issues, setIssues] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    setMounted(true)

    // Initialize with mock data
    setIssues(MOCK_ISSUES)

    // Try to load issues from localStorage if available
    try {
      const savedIssues = localStorage.getItem("reportedIssues")
      if (savedIssues) {
        const parsedIssues = JSON.parse(savedIssues)
        setIssues([...MOCK_ISSUES, ...parsedIssues])
      }
    } catch (e) {
      console.error("Error loading saved issues:", e)
    }
  }, [])

  const refreshData = () => {
    setIsRefreshing(true)

    // Try to reload issues from localStorage
    try {
      const savedIssues = localStorage.getItem("reportedIssues")
      if (savedIssues) {
        const parsedIssues = JSON.parse(savedIssues)
        setIssues([...MOCK_ISSUES, ...parsedIssues])
      } else {
        setIssues(MOCK_ISSUES)
      }
    } catch (e) {
      console.error("Error loading saved issues:", e)
      setIssues(MOCK_ISSUES)
    }

    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved"
      case "in-progress":
        return "In Progress"
      default:
        return "Pending"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-amber-100 text-amber-800 border-amber-300"
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Roads":
        return "border-l-4 border-blue-500"
      case "Utilities":
        return "border-l-4 border-purple-500"
      case "Parks":
        return "border-l-4 border-emerald-500"
      case "Public Facilities":
        return "border-l-4 border-blue-500"
      case "Cleanliness":
        return "border-l-4 border-teal-500"
      case "Miscellaneous":
        return "border-l-4 border-gray-500"
      default:
        return "border-l-4 border-gray-500"
    }
  }

  const getCategoryBgColor = (category) => {
    switch (category) {
      case "Roads":
        return "bg-blue-500"
      case "Utilities":
        return "bg-black-500"
      case "Parks":
        return "bg-black-500"
      case "Public Facilities":
        return "bg-black-500"
      case "Cleanliness":
        return "bg-black-500"
      case "Miscellaneous":
        return "bg-black-500"
      default:
        return "bg-black-500"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Roads":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>🛣️</div>
      case "Utilities":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>💡</div>
      case "Parks":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>🌳</div>
      case "Public Facilities":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>🏢</div>
      case "Cleanliness":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>🧹</div>
      case "Miscellaneous":
        return <div className={`absolute top-3 left-3 ${getCategoryBgColor(category)} text-white p-2 rounded-full`}>🔄</div>
      default:
        return null
    }
  }

  const filteredIssues = issues.filter((issue) => {
    if (activeTab !== "all" && issue.status !== activeTab) return false
    if (
      searchQuery &&
      !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false
    return true
  })

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-md backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Back Button and Page Title */}
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back To Home
                </Button>
              </Link>
            </div>

            {/* Dashboard Link and Actions */}
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <Button 
                variant="ghost" 
                onClick={refreshData} 
                disabled={isRefreshing}
                className="text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Dashboard Link */}
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-none hover:opacity-90 transition-all duration-300"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4 tracking-tight font-heading">
            Community Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-body">
            Track community issues and be part of the solution
          </p>
        </div>

        <div className="mb-8 bg-white rounded-xl p-6 shadow-lg border border-indigo-100 transform transition-all hover:shadow-xl duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
              <Input
                placeholder="Search issues..."
                className="pl-10 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Roads">Roads</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Parks">Parks</SelectItem>
                  <SelectItem value="Public Facilities">Public Facilities</SelectItem>
                  <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full bg-indigo-50 rounded-lg p-1">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  All Issues
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  In Progress
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <AnimatePresence>
              {filteredIssues.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg p-8 text-center shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-amber-50 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-12 w-12 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Issues Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setActiveTab('all');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                filteredIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredCard(issue.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    layout
                  >
                    <Card 
                      className={`overflow-hidden border shadow-md bg-white ${getCategoryColor(issue.category)} ${hoveredCard === issue.id ? 'ring-2 ring-indigo-300 shadow-xl' : 'shadow-md'} transition-all duration-300`}
                      style={{
                        boxShadow: hoveredCard === issue.id ? '0 10px 25px -5px rgba(79, 70, 229, 0.2)' : '',
                        backgroundColor: hoveredCard === issue.id ? 
                          issue.category === "Roads" ? '#fff8f0' : 
                          issue.category === "Utilities" ? '#f9f1ff' : 
                          issue.category === "Parks" ? '#f0fdf6' :
                          issue.category === "Public Facilities" ? '#f0f7ff' :
                          issue.category === "Cleanliness" ? '#e6fffa' :
                          issue.category === "Miscellaneous" ? '#f7f7f7' : '#ffffff'
                          : '#ffffff'
                      }}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <Image
                            src={issue.image || "/placeholder.svg"}
                            alt={issue.title}
                            width={400}
                            height={200}
                            className="w-full h-52 object-cover transition-transform duration-500 ease-in-out"
                            style={{
                              transform: hoveredCard === issue.id ? 'scale(1.05)' : 'scale(1)',
                            }}
                          />
                          {getCategoryIcon(issue.category)}
                          <Badge 
                            className={`${getStatusColor(issue.status)} absolute top-3 right-3 py-1 px-3 rounded-full font-medium text-xs shadow-md`}
                          >
                            {getStatusIcon(issue.status)}
                            <span className="ml-1">{getStatusText(issue.status)}</span>
                          </Badge>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{issue.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                              <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                              {issue.location}
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-full">
                              {new Date(issue.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter 
                        className="px-6 py-4 flex justify-between transition-colors duration-300"
                        style={{
                          backgroundColor: issue.category === "Roads" ? '#fff8f0' : 
                                          issue.category === "Utilities" ? '#f9f1ff' : 
                                          issue.category === "Parks" ? '#f0fdf6' :
                                          issue.category === "Public Facilities" ? '#f0f7ff' :
                                          issue.category === "Cleanliness" ? '#e6fffa' :
                                          issue.category === "Miscellaneous" ? '#f7f7f7' : '#f5f7ff'
                        }}
                      >
                        <div className="flex gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {issue.upvotes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {issue.comments}
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedIssue(issue)}
                          className="bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="sticky top-20 h-[calc(100vh-8rem)]">
            <Card className="h-full overflow-hidden shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <CardTitle>Issue Locations</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)] relative">
                {mapError ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="text-red-500 text-center p-4">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-medium mb-2">Failed to load map</p>
                      <p className="text-sm text-gray-600 mb-4">Please refresh the page to try again</p>
                      <Button 
                        variant="outline" 
                        className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                ) : (
                  <MapWithNoSSR
                    issues={filteredIssues}
                    selectedIssue={selectedIssue}
                    onMarkerClick={setSelectedIssue}
                    center={[13.0827, 80.2707]} // Chennai coordinates
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Report Issue Button with animation */}
      <div className="fixed bottom-8 right-8 z-20">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/resident/report">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg rounded-full px-6 transition-all duration-300"
              style={{
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Report an Issue
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
         
  :root {
    --font-heading: 'Poppins', sans-serif;
    --font-body: 'Inter', sans-serif;
  }
         
  .font-heading {
    font-family: var(--font-heading);
  }
         
  .font-body {
    font-family: var(--font-body);
  }
         
  body {
    font-family: var(--font-body);
    background-color: white;
  }
         
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
`}</style>
    </div>
  )
}