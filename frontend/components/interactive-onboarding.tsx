"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ChevronRight, MapPin, Search, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STEPS = [
  {
    id: 1,
    title: "Tell us about yourself",
    description: "Help us personalize your experience",
  },
  {
    id: 2,
    title: "Find your communities",
    description: "Discover groups that match your interests",
  },
  {
    id: 3,
    title: "Ready to connect",
    description: "Your profile is set up and ready to go",
  },
]

const INTERESTS = [
  "Technology",
  "Outdoors",
  "Arts & Culture",
  "Food & Drink",
  "Fitness",
  "Books",
  "Music",
  "Gaming",
  "Professional Development",
  "Languages",
  "Photography",
  "Travel",
  "Pets",
  "Sports",
  "Movies",
]

export function InteractiveOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -top-10 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium
                  ${currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              {step.id < STEPS.length && (
                <div className={`w-10 h-1 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="border shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{STEPS[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      className="pl-9"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-type">Account type</Label>
                  <Select defaultValue="individual">
                    <SelectTrigger id="account-type">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search interests..." />
                </div>

                <div className="space-y-2">
                  <Label>Select your interests (choose at least 3)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        className={`
                          px-3 py-1 text-xs rounded-full transition-colors
                          ${
                            selectedInterests.includes(interest)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }
                        `}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recommended communities</Label>
                  <div className="space-y-2 mt-2">
                    {selectedInterests.length > 0 ? (
                      selectedInterests.slice(0, 3).map((interest) => (
                        <div key={interest} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{interest} Group</h4>
                              <p className="text-xs text-muted-foreground">1,234 members</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            Join
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Select interests to see recommended communities</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 py-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold">You're all set!</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs">
                    Your profile is ready and you can start connecting with communities that match your interests.
                  </p>
                </div>
              </div>
            )}

            {currentStep < 3 && (
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={handlePrevStep} disabled={currentStep === 1}>
                  Back
                </Button>
                <Button onClick={handleNextStep}>
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

