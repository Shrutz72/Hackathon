"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"

export function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95 transition-transform"
        onClick={() => setIsModalOpen(true)}
      >
        Log in
      </Button>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

