import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"

export default async function Home() {
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

  // Redirect authenticated sellers to dashboard
  redirect("/dashboard")
}
