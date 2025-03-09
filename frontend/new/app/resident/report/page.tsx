"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Send, CheckCircle2, Upload, X, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import dynamic from "next/dynamic"

// Import Map component with no SSR and error handling
const MapWithNoSSR = dynamic(
  () =>
    import("@/components/Map").catch((err) => {
      console.error("Error loading Map component:", err)
      return () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-red-500">Failed to load map. Please refresh the page.</div>
        </div>
      )
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  },
)

export default function ReportIssuePage() {
  const router = useRouter()
  const [formStep, setFormStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [location, setLocation] = useState({ lat: 13.0827, lng: 80.2707 }) // Default to Chennai
  const [mounted, setMounted] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    priority: "medium",
    name: "",
    email: "",
    phone: "",
    receiveUpdates: false,
    // New manual address fields
    manualAddress: "",
    streetName: "",
    landmark: "",
    area: "",
    city: "Chennai",
    pincode: "",
    useManualAddress: false,
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
    setImageFiles([...imageFiles, ...files])
  }

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews]
    const newFiles = [...imageFiles]

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index])

    newPreviews.splice(index, 1)
    newFiles.splice(index, 1)

    setImagePreviews(newPreviews)
    setImageFiles(newFiles)
  }

  const handleMapClick = useCallback((e) => {
    if (e && e.latlng) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  }, [])

  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.title.trim()) errors.title = "Title is required"
      if (!formData.category) errors.category = "Category is required"
      if (!formData.description.trim()) errors.description = "Description is required"
    } else if (step === 2) {
      if (formData.useManualAddress) {
        if (!formData.streetName.trim()) errors.streetName = "Street name is required"
        if (!formData.area.trim()) errors.area = "Area is required"
        if (!formData.pincode.trim()) errors.pincode = "Pincode is required"
        else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = "Please enter a valid 6-digit pincode"
      }
    } else if (step === 3) {
      if (!formData.name.trim()) errors.name = "Name is required"
      if (!formData.email.trim()) errors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(formStep + 1)
    }
  }

  const prevStep = () => {
    setFormStep(formStep - 1)
  }

  const getFormattedAddress = () => {
    if (formData.useManualAddress) {
      const addressParts = [
        formData.streetName,
        formData.landmark,
        formData.area,
        formData.city,
        formData.pincode
      ].filter(Boolean)
      return addressParts.join(", ")
    } else {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}, Chennai`
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      // Create a new issue object
      const newIssue = {
        id: Date.now(), // Use timestamp as ID
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: getFormattedAddress(),
        coordinates: formData.useManualAddress ? null : location,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        upvotes: 0,
        comments: 0,
        image: imagePreviews.length > 0 ? imagePreviews[0] : "/placeholder.svg?height=200&width=300",
        updates: [{ date: new Date().toISOString().split("T")[0], note: "Issue reported and pending review" }],
        reporter: formData.name,
        contact: formData.email,
        priority: formData.priority,
        manualAddress: formData.useManualAddress ? {
          streetName: formData.streetName,
          landmark: formData.landmark,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode
        } : null
      }

      // Save to localStorage
      const existingIssues = JSON.parse(localStorage.getItem("reportedIssues") || "[]")
      localStorage.setItem("reportedIssues", JSON.stringify([...existingIssues, newIssue]))

      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)

        // Redirect after success
        setTimeout(() => {
          router.push("/resident/dashboard")
        }, 2000)
      }, 1500)
    } catch (error) {
      console.error("Error saving issue:", error)
      setIsSubmitting(false)
      alert("There was an error submitting your report. Please try again.")
    }
  }

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/resident/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Report an Issue</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us improve your community by reporting issues that need attention
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden border shadow-lg bg-white">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-2xl font-bold">Community Issue Report</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="mx-auto mb-6 rounded-full bg-green-100 p-3 w-20 h-20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted Successfully!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your report. We'll review it and take appropriate action.
                  </p>
                  <p className="text-gray-500 text-sm">Redirecting you back to the dashboard...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">Step {formStep} of 3</div>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((step) => (
                          <motion.div
                            key={step}
                            className={`h-2 w-8 rounded-full ${
                              step === formStep ? "bg-blue-600" : step < formStep ? "bg-blue-400" : "bg-gray-200"
                            }`}
                            initial={{ width: 20 }}
                            animate={{ width: step === formStep ? 40 : 20 }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(formStep / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {formStep === 1 && (
                    <motion.div
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="title" className="text-base">
                          Issue Title
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Brief description of the issue"
                          className={`mt-1 ${formErrors.title ? "border-red-500" : ""}`}
                        />
                        {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-base">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                          required
                        >
                          <SelectTrigger className={`mt-1 ${formErrors.category ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Roads">Roads & Sidewalks</SelectItem>
                            <SelectItem value="Clean">Cleanliness</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Parks">Parks & Recreation</SelectItem>
                            <SelectItem value="Waste">Waste Management</SelectItem>
                            <SelectItem value="Noise">Noise Complaints</SelectItem>
                            <SelectItem value="Public Facilities">Public Facilities</SelectItem>
                            <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base">
                          Detailed Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Please provide details about the issue"
                          className={`mt-1 min-h-[120px] ${formErrors.description ? "border-red-500" : ""}`}
                        />
                        {formErrors.description && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="flex items-start space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="useManualAddress"
                          name="useManualAddress"
                          checked={formData.useManualAddress}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-1"
                        />
                        <Label htmlFor="useManualAddress" className="text-sm">
                          Use manual address instead of map location
                        </Label>
                      </div>

                      {!formData.useManualAddress ? (
                        <div>
                          <Label className="text-base">Location</Label>
                          <div className="mt-1 h-64 rounded-md overflow-hidden border relative">
                            {mapError ? (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <div className="text-red-500 text-center p-4">
                                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                  <p>Failed to load map. Please refresh the page.</p>
                                </div>
                              </div>
                            ) : (
                              <MapWithNoSSR
                                center={[13.0827, 80.2707]} // Chennai coordinates
                                zoom={12}
                                onClick={handleMapClick}
                                marker={location}
                              />
                            )}
                          </div>
                          {location.lat && location.lng && (
                            <div className="mt-2 text-sm flex items-center text-gray-700">
                              <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                              Selected location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)} (Chennai)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="streetName" className="text-base">
                              Street Name / Door Number
                            </Label>
                            <Input
                              id="streetName"
                              name="streetName"
                              value={formData.streetName}
                              onChange={handleInputChange}
                              placeholder="Enter street name and door number"
                              className={`mt-1 ${formErrors.streetName ? "border-red-500" : ""}`}
                            />
                            {formErrors.streetName && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.streetName}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="landmark" className="text-base">
                              Landmark (Optional)
                            </Label>
                            <Input
                              id="landmark"
                              name="landmark"
                              value={formData.landmark}
                              onChange={handleInputChange}
                              placeholder="Nearby landmark"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="area" className="text-base">
                              Area / Locality
                            </Label>
                            <Input
                              id="area"
                              name="area"
                              value={formData.area}
                              onChange={handleInputChange}
                              placeholder="Enter area or locality"
                              className={`mt-1 ${formErrors.area ? "border-red-500" : ""}`}
                            />
                            {formErrors.area && <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city" className="text-base">
                                City
                              </Label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                disabled
                                className="mt-1 bg-gray-100"
                              />
                            </div>

                            <div>
                              <Label htmlFor="pincode" className="text-base">
                                Pincode
                              </Label>
                              <Input
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="6-digit pincode"
                                className={`mt-1 ${formErrors.pincode ? "border-red-500" : ""}`}
                              />
                              {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-base">Priority Level</Label>
                        <RadioGroup
                          value={formData.priority}
                          onValueChange={(value) => handleSelectChange("priority", value)}
                          className="mt-2 grid grid-cols-3 gap-4"
                        >
                          <Label
                            htmlFor="priority-low"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-blue-500"
                          >
                            <RadioGroupItem value="low" id="priority-low" className="sr-only" />
                            <div className="text-center space-y-2">
                              <div className="font-medium">Low</div>
                              <div className="text-xs text-muted-foreground">Not urgent</div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="priority-medium"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-blue-500"
                          >
                            <RadioGroupItem value="medium" id="priority-medium" className="sr-only" />
                            <div className="text-center space-y-2">
                              <div className="font-medium">Medium</div>
                              <div className="text-xs text-muted-foreground">Needs attention</div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="priority-high"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-blue-500"
                          >
                            <RadioGroupItem value="high" id="priority-high" className="sr-only" />
                            <div className="text-center space-y-2">
                              <div className="font-medium">High</div>
                              <div className="text-xs text-muted-foreground">Urgent issue</div>
                            </div>
                          </Label>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="photo" className="text-base">
                          Upload Photos (Optional)
                        </Label>
                        <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {imagePreviews.length === 0 ? (
                            <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Drag and drop your images here, or choose an option below
                          </p>
                        <div className="flex gap-2 justify-center">
                          {/* Choose from Device Button */}
                        <label htmlFor="photo-from-device">
                        <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("photo-from-device").click()} // Trigger file input
            >
              <Camera className="h-4 w-4" />
              <span>Choose from Device</span>
            </Button>
          </label>

          {/* Take Photo Button */}
          <label htmlFor="photo-from-camera">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("photo-from-camera").click()} // Trigger camera input
            >
              <Camera className="h-4 w-4" />
              <span>Take Photo</span>
            </Button>
          </label>
        </div>

        {/* Hidden File Input for Device */}
        <input
          type="file"
          id="photo-from-device"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Hidden File Input for Camera */}
        <input
          type="file"
          id="photo-from-camera"
          accept="image/*"
          capture="environment" // Use "user" for front camera, "environment" for rear camera
          className="hidden"
          onChange={handleImageUpload}
        />
      </>
    ) : (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <Image
                src={preview || "/placeholder.svg"}
                alt={`Preview ${index}`}
                width={100}
                height={100}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          {/* Add More from Device Button */}
          <label htmlFor="photo-from-device">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("photo-from-device").click()} // Trigger file input
            >
              <Camera className="h-4 w-4" />
              <span>Add More from Device</span>
            </Button>
          </label>

          {/* Take Another Photo Button */}
          <label htmlFor="photo-from-camera">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("photo-from-camera").click()} // Trigger camera input
            >
              <Camera className="h-4 w-4" />
              <span>Take Another Photo</span>
            </Button>
          </label>
        </div>
      </div>
    )}
  </div>
</div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="name" className="text-base">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className={`mt-1 ${formErrors.name ? "border-red-500" : ""}`}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-base">
                          Email Id
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your email address"
                          className={`mt-1 ${formErrors.email ? "border-red-500" : ""}`}
                        />
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-base">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Your phone number"
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-start space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="receiveUpdates"
                          name="receiveUpdates"
                          checked={formData.receiveUpdates}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-1"
                        />
                        <Label htmlFor="receiveUpdates" className="text-sm">
                          I would like to receive updates about this issue via email
                        </Label>
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="mr-2"
                              >
                                <svg
                                  className="animate-spin h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </motion.div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Report
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
