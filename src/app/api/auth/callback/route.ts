import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseServer"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user && !user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role: "seller" } })

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!existingUser) {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ id: user.id, email: user.email, role: "supplier" })
          .select("id")
          .single()

        if (newUser) {
          await supabase
            .from("suppliers")
            .insert({ user_id: newUser.id, factory_header: "Pending Setup" })
        }
      }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user?.id ?? "")
    .single()

  const destination = profile?.role === "buyer" ? "/buyer/dashboard" : "/dashboard"
  return NextResponse.redirect(`${origin}${destination}`)
}