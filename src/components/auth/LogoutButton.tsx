"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await signOut()
    router.push("/login")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}