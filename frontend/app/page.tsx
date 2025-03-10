"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ChevronRight,
  ArrowRight,
  Heart,
  Star,
  MapPin,
  Bell,
  Shield,
  BarChart,
  Camera,
  Database,
  Zap,
  Globe,
  Sparkles,
} from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { AnimatedHero } from "@/components/animated-hero"
import { CommunityMap } from "@/components/community-map"
import { ActivityFeed } from "@/components/activity-feed"
import { InteractiveOnboarding } from "@/components/interactive-onboarding"
import { CommunityAnimation } from "@/components/community-animation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveCursor } from "@/components/interactive-cursor"
import { useRouter } from "next/navigation" 

export default function Home() {
  const router = useRouter() 

  return (
    <div className="flex flex-col min-h-dvh">
      <InteractiveCursor />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 group">
            <Users className="h-6 w-6 text-primary group-hover:animate-spin-slow transition-all duration-300" />
            <span className="text-xl font-bold text-gradient">CommUnity</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              className="bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform text-black"
              onClick={() => router.push("/home")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-mesh">
          <AnimatedHero />
          <div className="container relative z-10">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-6 animate-slideInLeft">
                <Badge className="px-3 py-1 text-sm bg-white/80 backdrop-blur-sm text-primary">
                  Join 10,000+ members
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Connect with your <span className="text-gradient">community</span> like never before
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Discover events, share ideas, and build meaningful connections in a space designed for collaboration
                  and growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                <Button
              size="sm"
              className="bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform text-pink"
              onClick={() => router.push("/home")}
            >
              Get Started
            </Button>
                </div>
              </div>
              <div className="relative animate-slideInRight">
                <InteractiveOnboarding />
              </div>
            </div>
          </div>
        </section>

        <section id="abstract" className="py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Badge className="mb-4 bg-purple-light/20 text-purple-dark hover:bg-purple-light/30" variant="outline">
                Our Vision
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-scaleUp">
                Transforming <span className="text-gradient font-serif">Civic Engagement</span>
              </h2>
              <p className="mt-4 text-muted-foreground md:text-xl leading-relaxed animate-scaleUp animate-delay-200">
                The proposed platform aims to enhance civic engagement by providing a user-friendly app or website where
                residents can report local issues such as potholes, waste accumulation, and power outages. Utilizing
                geo-tagging, real-time tracking, and community collaboration, the platform ensures efficient problem
                resolution while promoting transparency in local governance.
              </p>
              <p className="text-muted-foreground md:text-xl leading-relaxed animate-scaleUp animate-delay-300">
                By integrating local authorities and data-driven resource allocation, the platform strengthens
                governance and public trust. Additionally, it supports long-term sustainability projects and awareness
                campaigns, encouraging community-driven initiatives.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-purple-light/10 rounded-lg p-6 text-left animate-scaleUp animate-delay-400 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-purple-dark" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Geo-Tagging</h3>
                  <p className="text-sm text-muted-foreground">
                    Precisely locate and track issues with advanced mapping technology
                  </p>
                </div>

                <div className="bg-blue-light/10 rounded-lg p-6 text-left animate-scaleUp animate-delay-500 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-blue-light/20 flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-blue-dark" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay informed with instant notifications on issue status changes
                  </p>
                </div>

                <div className="bg-purple-light/10 rounded-lg p-6 text-left animate-scaleUp animate-delay-600 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-purple-dark" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together with neighbors and officials to solve community problems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="py-12 bg-blue-light/10">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2 card-hover p-4 rounded-lg">
                <h3 className="text-3xl font-bold text-purple-dark">
                  <AnimatedCounter value={10} suffix="k+" />
                </h3>
                <p className="text-muted-foreground">Active Members</p>
              </div>
              <div className="space-y-2 card-hover p-4 rounded-lg">
                <h3 className="text-3xl font-bold text-blue-dark">
                  <AnimatedCounter value={500} suffix="+" />
                </h3>
                <p className="text-muted-foreground">Events Monthly</p>
              </div>
              <div className="space-y-2 card-hover p-4 rounded-lg">
                <h3 className="text-3xl font-bold text-purple-dark">
                  <AnimatedCounter value={120} suffix="+" />
                </h3>
                <p className="text-muted-foreground">Communities</p>
              </div>
              <div className="space-y-2 card-hover p-4 rounded-lg">
                <h3 className="text-3xl font-bold text-blue-dark">
                  <AnimatedCounter value={98} suffix="%" />
                </h3>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        <section id="problem-solution" className="py-20 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-scaleUp">
                <Badge className="mb-2 bg-purple-light/20 text-purple-dark hover:bg-purple-light/30" variant="outline">
                  Problem Statement
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter">Communities face inefficient issue reporting</h2>
                <p className="text-muted-foreground">
                  Communities often struggle with inefficient reporting and resolution of local issues due to a lack of
                  structured platforms for communication, transparency, and citizen engagement.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="text-xs">✕</span>
                    </div>
                    <span>Fragmented communication channels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="text-xs">✕</span>
                    </div>
                    <span>Lack of transparency in issue resolution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <span className="text-xs">✕</span>
                    </div>
                    <span>Limited citizen engagement opportunities</span>
                  </li>
                </ul>

                <div className="mt-6 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="/placeholder.svg?height=300&width=400"
                    alt="Broken infrastructure"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="space-y-6 animate-scaleUp animate-delay-300">
                <Badge className="mb-2 bg-blue-light/20 text-blue-dark hover:bg-blue-light/30" variant="outline">
                  Proposed Solution
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter">A digital platform for community action</h2>
                <p className="text-muted-foreground">
                  Develop a digital platform (app/website) where residents can report, track, and collaborate on
                  resolving local issues. Features include geo-tagging, real-time updates, community participation,
                  government integration, and incentives for engagement.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <span className="text-xs">✓</span>
                    </div>
                    <span>Streamlined issue reporting with geo-tagging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <span className="text-xs">✓</span>
                    </div>
                    <span>Real-time tracking and transparent updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <span className="text-xs">✓</span>
                    </div>
                    <span>Community collaboration and government integration</span>
                  </li>
                </ul>

                <div className="mt-6 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="/placeholder.svg?height=300&width=400"
                    alt="Community app interface"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="impact"
          className="py-20 bg-gradient-radial from-purple-light/30 via-blue-light/30 to-purple-light/20"
        >
          <div className="container">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-white/20 text-purple-dark hover:bg-white/30" variant="outline">
                Impact
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-serif">
                Creating <span className="text-gradient">Lasting Change</span>
              </h2>
              <p className="mt-4 md:text-xl">
                This solution enhances civic engagement, improves response times for local issues, fosters government
                accountability, and encourages sustainable community-driven initiatives.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white border-purple-light/20 card-hover transform transition-all duration-300 hover:rotate-1">
                <CardHeader className="pb-2">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-blue-gradient text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-gradient font-serif">Enhanced Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Empowers citizens to actively participate in community improvement through an accessible digital
                    platform.
                  </p>
                  <div className="mt-4 h-1 w-full bg-gradient-to-r from-purple-light to-blue-light rounded-full" />
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">Sarah J.</p>
                      <p className="text-muted-foreground">
                        "The platform made it easy to report issues in my neighborhood."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue-light/20 card-hover transform transition-all duration-300 hover:rotate-1">
                <CardHeader className="pb-2">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-purple-gradient text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-gradient font-serif">Government Accountability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Increases transparency in issue resolution and strengthens trust between citizens and local
                    authorities.
                  </p>
                  <div className="mt-4 h-1 w-full bg-gradient-to-r from-blue-light to-purple-light rounded-full" />
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="Official"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">Mayor Thompson</p>
                      <p className="text-muted-foreground">"This has transformed how we respond to community needs."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-light/20 card-hover transform transition-all duration-300 hover:rotate-1">
                <CardHeader className="pb-2">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-blue-gradient text-white">
                    <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-gradient font-serif">Sustainable Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Builds a more connected and proactive society with long-term improvements in local infrastructure.
                  </p>
                  <div className="mt-4 h-1 w-full bg-gradient-to-r from-purple-light to-blue-light rounded-full" />
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="Community"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">Green Initiative</p>
                      <p className="text-muted-foreground">
                        "We've seen a 40% increase in community-led sustainability projects."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4 text-gradient font-serif">Measurable Results</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-light/20 flex items-center justify-center">
                        <span className="font-bold text-purple-dark">85%</span>
                      </div>
                      <span>Faster issue resolution time</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-light/20 flex items-center justify-center">
                        <span className="font-bold text-blue-dark">3x</span>
                      </div>
                      <span>Increase in citizen participation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-light/20 flex items-center justify-center">
                        <span className="font-bold text-purple-dark">40%</span>
                      </div>
                      <span>Reduction in recurring issues</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-mesh p-6 flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Impact statistics"
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-purple-light/20 text-purple-dark hover:bg-purple-light/30" variant="outline">
                Core Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Game-changing features for modern communities
              </h2>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Our platform is designed to make community engagement more interactive, meaningful, and fun.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">Map Syncing</h3>
                <p className="mt-2 text-muted-foreground">
                  Allow users to manually enter addresses or drop pins on a real-time map for issue reporting.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">Photo Storage</h3>
                <p className="mt-2 text-muted-foreground">
                  Create a secure, scalable database to store photos and videos uploaded by users for issue
                  documentation.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">User Login Database</h3>
                <p className="mt-2 text-muted-foreground">
                  Develop a secure database to store user login credentials with role-based access for tailored
                  functionality.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">Notifications Database</h3>
                <p className="mt-2 text-muted-foreground">
                  Build a database to manage real-time notifications for users and authorities with customizable
                  preferences.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">AI-Powered Categorization</h3>
                <p className="mt-2 text-muted-foreground">
                  Automatically classify and prioritize reported issues using machine learning for efficient resolution.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:border-primary transition-colors card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <BarChart className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif">Data Visualization</h3>
                <p className="mt-2 text-muted-foreground">
                  Generate heatmaps to visualize problem-prone areas and trends for better resource allocation.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="community-animation" className="py-20 bg-blue-light/10">
          <div className="container">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-blue-light/20 text-blue-dark hover:bg-blue-light/30" variant="outline">
                Community in Action
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">See how communities come together</h2>
              <p className="mt-4 text-muted-foreground">
                Our platform facilitates meaningful connections and collaborative problem-solving among community
                members.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <CommunityAnimation />
            </div>
          </div>
        </section>

        <section id="community-map" className="py-20 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-purple-light/20 text-purple-dark hover:bg-purple-light/30" variant="outline">
                  Interactive
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Discover communities near you</h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  Our interactive community map helps you find and connect with local groups and events in your area.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Star className="h-3 w-3" />
                    </div>
                    <span>Find communities based on your interests</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Star className="h-3 w-3" />
                    </div>
                    <span>Connect with local event organizers</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Star className="h-3 w-3" />
                    </div>
                    <span>Get personalized community recommendations</span>
                  </li>
                </ul>
                <Button className="mt-6 group bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform">
                  Explore the Map
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden border">
                <CommunityMap />
              </div>
            </div>
          </div>
        </section>

        <section id="activity" className="py-20 bg-blue-light/10">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative h-[500px] rounded-lg overflow-hidden border">
                <ActivityFeed />
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-blue-light/20 text-blue-dark hover:bg-blue-light/30" variant="outline">
                  Real-time
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Stay updated with community activity
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  Our real-time activity feed keeps you informed about what's happening in your communities.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Heart className="h-3 w-3" />
                    </div>
                    <span>See new events as they're created</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Heart className="h-3 w-3" />
                    </div>
                    <span>Follow discussions in real-time</span>
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Heart className="h-3 w-3" />
                    </div>
                    <span>Get notified about community milestones</span>
                  </li>
                </ul>
                <Button className="mt-6 group bg-blue-purple-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform">
                  View Activity
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="join" className="py-20 bg-gray-900 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to join our community?
            </h2>
            <p className="mt-4 mx-auto max-w-2xl md:text-xl">
              Sign up today and start connecting with like-minded individuals in your area.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex-1 max-w-sm">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/80">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-gradient">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Communities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-bold text-gradient">CommUnity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CommUnity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

