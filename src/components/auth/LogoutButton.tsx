"use client"

import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  return (
    <Button variant="outline" size="sm" onClick={signOut}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}