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
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// Google Login
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/api/auth/callback",
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