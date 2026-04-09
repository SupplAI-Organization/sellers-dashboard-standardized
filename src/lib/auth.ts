import { supabase } from "./supabaseClient"

// Email Sign Up
export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            role: "seller"
        }
    }
  })
}

// Email Login
export async function signIn(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Store user profile in localStorage after successful login
  if (result.data?.user && !result.error) {
    try {
      const userId = result.data.user.id
      
      // Fetch user profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .maybeSingle()

      // Fetch supplier profile
      const { data: supplierProfile } = await supabase
        .from("supplier_profiles")
        .select("business_name, contact_person")
        .eq("supplier_id", userId)
        .maybeSingle()

      // Determine display name
      const displayName = userProfile?.full_name || supplierProfile?.contact_person || email?.split("@")[0] || "User"
      const displayEmail = userProfile?.email || email || ""
      
      // Store in localStorage
      if (typeof window !== "undefined") {
        const profileData = {
          id: userId,
          displayName,
          displayEmail,
          userProfile,
          supplierProfile,
        }
        localStorage.setItem("userProfile", JSON.stringify(profileData))
      }
    } catch (error) {
      console.error("Error storing profile:", error)
    }
  }

  return result
}

// Google Login
export async function signInWithGoogle() {
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      queryParams: {
        role: "seller",
      },
    },
  })
}

// Logout
export async function signOut() {
  return await supabase.auth.signOut()
}