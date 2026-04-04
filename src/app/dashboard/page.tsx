import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import LogoutButton from "@/components/auth/LogoutButton"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("business_name")
    .eq("id", user.id)
    .single()

  if (!profile?.business_name) {
    redirect("/onboarding")
  }

  return <div>Welcome {user.email} 
  <LogoutButton/> 
  </div>
}