"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    business_name: "",
    gstin: "",
    business_address: "",
    contact_person: "",
    contact_number: "",
  })

  const [touched, setTouched] = useState({
    business_name: false,
    gstin: false,
    business_address: false,
    contact_person: false,
    contact_number: false,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  function handleBlur(field: keyof typeof form) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Session expired. Please sign in again.")
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from("users")
        .upsert({ id: user.id, email: user.email, role: "seller", ...form })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      const { data: existingSupplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!existingSupplier) {
        const { error: supplierError } = await supabase
          .from("suppliers")
          .insert({ user_id: user.id, factory_header: form.business_name })

        if (supplierError) {
          setError(supplierError.message)
          setLoading(false)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const isFormValid = 
    form.business_name.trim() &&
    form.gstin.trim() &&
    form.business_address.trim() &&
    form.contact_person.trim() &&
    form.contact_number.trim()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#F4EBD3'}}>
      <Card className="w-full max-w-xl shadow-lg" style={{backgroundColor: '#F4EBD3'}}>
        <CardHeader className="space-y-2 pb-8">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold" style={{color: '#1B3C53'}}>Complete Your Profile</CardTitle>
            <CardDescription style={{color: '#666'}}>
              Set up your business information to start selling
            </CardDescription>
          </div>
          <div className="text-xs font-medium" style={{color: '#999'}}>
            Step 1 of 1 • Complete Setup
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert className="space-x-3" style={{backgroundColor: '#FFE6E6', borderColor: '#D2C1B6', color: '#1B3C53'}}>
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="space-x-3" style={{backgroundColor: '#E6F9E6', borderColor: '#D2C1B6', color: '#1B3C53'}}>
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-sm">Profile created successfully. Redirecting...</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="business_name" className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                Business Name *
              </Label>
              <Input
                id="business_name"
                name="business_name"
                placeholder="e.g., ABC Foods Pvt Ltd"
                value={form.business_name}
                onChange={handleChange}
                onBlur={() => handleBlur('business_name')}
                required
                disabled={loading || success}
                className="border-slate-300 text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 h-10"
                style={{borderColor: '#D2C1B6', backgroundColor: '#fff'}}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="gstin" className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                GSTIN *
              </Label>
              <Input
                id="gstin"
                name="gstin"
                placeholder="22AABCT0060R1A0"
                value={form.gstin}
                onChange={handleChange}
                onBlur={() => handleBlur('gstin')}
                required
                disabled={loading || success}
                className="border-slate-300 text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 font-mono text-sm h-10"
                style={{borderColor: '#D2C1B6', backgroundColor: '#fff'}}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="business_address" className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                Business Address *
              </Label>
              <Input
                id="business_address"
                name="business_address"
                placeholder="Full address with city and state"
                value={form.business_address}
                onChange={handleChange}
                onBlur={() => handleBlur('business_address')}
                required
                disabled={loading || success}
                className="border-slate-300 text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 h-10"
                style={{borderColor: '#D2C1B6', backgroundColor: '#fff'}}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="contact_person" className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                Contact Person *
              </Label>
              <Input
                id="contact_person"
                name="contact_person"
                placeholder="Name of authorized person"
                value={form.contact_person}
                onChange={handleChange}
                onBlur={() => handleBlur('contact_person')}
                required
                disabled={loading || success}
                className="border-slate-300 text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 h-10"
                style={{borderColor: '#D2C1B6', backgroundColor: '#fff'}}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="contact_number" className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                Contact Number *
              </Label>
              <Input
                id="contact_number"
                name="contact_number"
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                value={form.contact_number}
                onChange={handleChange}
                onBlur={() => handleBlur('contact_number')}
                required
                disabled={loading || success}
                className="border-slate-300 text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 h-10"
                style={{borderColor: '#D2C1B6', backgroundColor: '#fff'}}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white text-base font-semibold h-11 shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
              style={{backgroundColor: '#1B3C53'}}
              disabled={loading || success || !isFormValid}
            >
              {loading ? "Creating profile..." : success ? "Redirecting..." : "Create Profile & Continue"}
            </Button>
          </form>

          <p className="text-xs text-center mt-6 pt-6 border-t" style={{color: '#999', borderTopColor: '#D2C1B6'}}>
            Your information will be kept secure and verified by our team
          </p>\n        </CardContent>
      </Card>
    </div>
  )
}
