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

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-900 px-6 text-center">
      <p className="text-2xl font-bold text-amber-50 md:text-4xl">
        Sohini eikhane landing page banash, /dashboard e redirect korish dashboard er jonne and /myproducts e redirect korish products dekhar jonne jeita ei supplier er, ekhon ei duto page e royeche r UI the dekhish ektu chaile ager app ta theke copy paste korte parish
      </p>
    </div>
  )
}
