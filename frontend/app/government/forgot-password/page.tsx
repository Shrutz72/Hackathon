"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Building, ArrowLeft, CheckCircle, Users } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [governmentId, setGovernmentId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate password reset process
    setTimeout(() => {
      if (governmentId && email) {
        setIsSubmitted(true);
      } else {
        setError("Please fill in all required fields");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header matching the main site */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 group">
            <Users className="h-6 w-6 text-primary group-hover:animate-spin-slow transition-all duration-300" />
            <span className="text-xl font-bold text-gradient">CommUnity</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/government">
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2 hover:bg-background hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-mesh py-16">
        <div className="container flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border animate-scaleUp">
            {isSubmitted ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <Badge className="px-3 py-1 text-sm bg-blue-light/20 text-blue-dark mx-auto">
                  Success
                </Badge>
                <h2 className="text-2xl font-bold tracking-tighter">Reset Link Sent</h2>
                <p className="text-muted-foreground">
                  If your Government ID and email are valid, you will receive 
                  instructions to reset your password shortly.
                </p>
                <Link href="/government">
                  <Button 
                    className="bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-6 text-center mb-8">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-blue-light/20 text-blue-dark">
                      <Building className="h-8 w-8" />
                    </div>
                  </div>
                  <Badge className="px-3 py-1 text-sm bg-purple-light/20 text-purple-dark mx-auto">
                    Account Recovery
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tighter">Forgot Password</h2>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm animate-scaleUp">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Government ID"
                      value={governmentId}
                      onChange={(e) => setGovernmentId(e.target.value)}
                      className="h-12 border-muted-foreground/20"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-muted-foreground/20"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-6 bg-purple-blue-gradient hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transition-transform text-black" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Reset Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
  );
}