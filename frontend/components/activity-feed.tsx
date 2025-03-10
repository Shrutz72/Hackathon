"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Calendar, Users } from "lucide-react"
import Link from "next/link"

// Mock activity data
const INITIAL_ACTIVITIES = [
  {
    id: 1,
    type: "event",
    user: { name: "Sarah Johnson", avatar: "/placeholder.svg?height=40&width=40", initials: "SJ" },
    content: "created a new event: Tech Meetup",
    time: "2 minutes ago",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    type: "post",
    user: { name: "Michael Chen", avatar: "/placeholder.svg?height=40&width=40", initials: "MC" },
    content: "Just shared a new article about community building strategies!",
    time: "15 minutes ago",
    likes: 24,
    comments: 7,
  },
  {
    id: 3,
    type: "join",
    user: { name: "Emma Wilson", avatar: "/placeholder.svg?height=40&width=40", initials: "EW" },
    content: "joined the Photography Group community",
    time: "32 minutes ago",
    likes: 8,
    comments: 2,
  },
  {
    id: 4,
    type: "event",
    user: { name: "David Kim", avatar: "/placeholder.svg?height=40&width=40", initials: "DK" },
    content: "is attending Outdoor Hiking Adventure",
    time: "1 hour ago",
    likes: 15,
    comments: 4,
  },
  {
    id: 5,
    type: "post",
    user: { name: "Jessica Martinez", avatar: "/placeholder.svg?height=40&width=40", initials: "JM" },
    content: "Shared photos from yesterday's community meetup!",
    time: "2 hours ago",
    likes: 42,
    comments: 11,
  },
]

// New activities that will appear in real-time
const NEW_ACTIVITIES = [
  {
    id: 6,
    type: "join",
    user: { name: "Alex Thompson", avatar: "/placeholder.svg?height=40&width=40", initials: "AT" },
    content: "joined the Tech Enthusiasts community",
    time: "Just now",
    likes: 0,
    comments: 0,
  },
  {
    id: 7,
    type: "post",
    user: { name: "Olivia Parker", avatar: "/placeholder.svg?height=40&width=40", initials: "OP" },
    content: "Asked a question about the upcoming virtual conference",
    time: "Just now",
    likes: 1,
    comments: 0,
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [newActivitiesCount, setNewActivitiesCount] = useState(0)

  // Simulate real-time activity updates
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Add first new activity after 5 seconds
    timers.push(
      setTimeout(() => {
        setNewActivitiesCount(1)
      }, 5000),
    )

    // Add second new activity after 12 seconds
    timers.push(
      setTimeout(() => {
        setNewActivitiesCount(2)
      }, 12000),
    )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [])

  const loadNewActivities = () => {
    setActivities([...NEW_ACTIVITIES.slice(0, newActivitiesCount), ...activities])
    setNewActivitiesCount(0)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Activity Feed</h3>
        <Badge variant="outline" className="text-xs">
          Live
        </Badge>
      </div>

      {newActivitiesCount > 0 && (
        <Button
          variant="outline"
          className="mx-4 mt-4 text-primary border-primary/20 bg-primary/5"
          onClick={loadNewActivities}
        >
          {newActivitiesCount} new {newActivitiesCount === 1 ? "activity" : "activities"}
        </Button>
      )}

      <div className="flex-1 overflow-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-4 border-b hover:bg-muted/50 transition-colors ${activity.id > 5 ? "animate-fadeIn" : ""}`}
          >
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <Link href="#" className="font-medium text-sm hover:underline">
                    {activity.user.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">{activity.content}</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{activity.time}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{activity.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{activity.comments}</span>
                  </div>
                </div>
              </div>

              {activity.type === "event" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
              )}

              {activity.type === "join" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Users className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

