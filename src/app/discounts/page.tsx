"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AppSidebar } from "@/components/AppSidebar"
import { AppTopbar } from "@/components/Apptopbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, ArrowRight } from "lucide-react"

interface DiscountSlab {
  id: number
  min_amount: string
  discount_percentage: string
}

export default function DiscountsPage() {
  const [slabs, setSlabs] = useState<DiscountSlab[]>([
    { id: Date.now(), min_amount: "", discount_percentage: "" }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userName, setUserName] = useState("Seller");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase.from('users').select('contact_person').eq('id', user.id).single();
        if (profile?.contact_person) {
          setUserName(profile.contact_person);
        } else {
          const { data: supplierProfile } = await supabase.from('supplier_profiles').select('contact_person').eq('supplier_id', user.id).single();
          if (supplierProfile?.contact_person) {
            setUserName(supplierProfile.contact_person);
          }
        }
      }
    }
    loadUser();
  }, []);

  const addRow = () => {
    setSlabs([...slabs, { id: Date.now(), min_amount: "", discount_percentage: "" }])
  }

  const removeRow = (id: number) => {
    if (slabs.length > 1) {
      setSlabs(slabs.filter(slab => slab.id !== id))
    }
  }

  const handleChange = (id: number, field: keyof DiscountSlab, value: string) => {
    setSlabs(slabs.map(slab => 
      slab.id === id ? { ...slab, [field]: value } : slab
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert("Error: You must be logged in to save discount tiers.")
        setIsSubmitting(false)
        return
      }

      // Fetch the actual supplier id from the suppliers table
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (supplierError || !supplierData) {
        alert("Error: Could not find supplier profile. Please complete onboarding.")
        setIsSubmitting(false)
        return
      }

      const supplierId = supplierData.id

      // Convert slabs data to match the expected database structure
      const dbSlabs = slabs
        .filter(slab => slab.min_amount.trim() !== "" && slab.discount_percentage.trim() !== "")
        .map(slab => ({
          supplier_id: supplierId,
          minimum_slab: parseFloat(slab.min_amount),
          discount_percentage: parseFloat(slab.discount_percentage)
        }))

      if (dbSlabs.length === 0) {
        alert("Please provide valid numbers for at least one discount tier.")
        setIsSubmitting(false)
        return
      }

      // Clear any existing slabs to prevent duplication 
      const { error: deleteError } = await supabase
        .from("discount_slabs")
        .delete()
        .eq("supplier_id", supplierId)

      if (deleteError) {
        console.error("Error clearing existing tiers:", deleteError)
      }

      // Insert the new configured slabs into the DB
      const { error: insertError } = await supabase
        .from("discount_slabs")
        .insert(dbSlabs)

      if (insertError) {
        throw insertError
      }
      
      alert("Discount tiers saved successfully!")
    } catch (error: any) {
      console.error("Error submitting discount slabs:", error?.message || JSON.stringify(error) || error)
      alert("Failed to save discount tiers: " + (error?.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden w-full">
      <AppTopbar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden w-full">
        <AppSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 w-full flex flex-col justify-center items-center">
          <div className="w-full max-w-3xl pb-16">
            
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2" style={{color: 'var(--dashboard-primary)'}}>Discount Tiers</h1>
              <p style={{color: 'var(--dashboard-text-muted)'}}>
                Configure multiple discount slabs based on purchase amount
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="text-xl" style={{color: 'var(--dashboard-primary)'}}>Custom Discount Rules</CardTitle>
                <CardDescription style={{color: 'var(--dashboard-text-muted)'}}>Add rows to configure how much discount your buyers get at different spending levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-8 pb-8">
                
                <div className="grid grid-cols-[1fr_1fr_auto] gap-6 mb-2 mt-4 px-2 items-end">
                  <Label className="text-sm font-bold uppercase tracking-wider" style={{color: 'var(--dashboard-primary)'}}>
                    Minimum Amount (Rs.)
                  </Label>
                  <Label className="text-sm font-bold uppercase tracking-wider" style={{color: 'var(--dashboard-primary)'}}>
                    Discount Allowed (%)
                  </Label>
                  <div className="w-10"></div> {/* Spacer for button */}
                </div>

                {slabs.map((slab, index) => (
                  <div key={slab.id} className="grid grid-cols-[1fr_1fr_auto] gap-6 items-center px-2 group">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium font-sans">₹</span>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        value={slab.min_amount}
                        onChange={(e) => handleChange(slab.id, "min_amount", e.target.value)}
                        required
                        className="pl-8 text-neutral-800 placeholder:text-neutral-400 font-medium h-12 focus-visible:ring-1 focus-visible:ring-offset-0 border-neutral-200"
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        value={slab.discount_percentage}
                        onChange={(e) => handleChange(slab.id, "discount_percentage", e.target.value)}
                        required
                        max="100"
                        min="0"
                        step="0.01"
                        className="pr-8 text-neutral-800 placeholder:text-neutral-400 font-medium h-12 focus-visible:ring-1 focus-visible:ring-offset-0 border-neutral-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {index === slabs.length - 1 ? (
                        <Button
                          type="button"
                          onClick={addRow}
                          size="icon"
                          className="h-12 w-12 rounded-xl shrink-0 transition-transform active:scale-95 shadow-sm"
                          style={{backgroundColor: 'var(--dashboard-primary)', color: '#fff'}}
                          title="Add another slab"
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => removeRow(slab.id)}
                          size="icon"
                          variant="ghost"
                          className="h-12 w-12 rounded-xl shrink-0 transition-opacity hover:bg-neutral-100 hover:text-red-500 text-neutral-400"
                          title="Remove slab"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {slabs.length === 0 && (
                  <Button type="button" onClick={addRow} variant="outline" className="w-full mt-4 border-neutral-200 text-neutral-600">
                    <Plus className="h-4 w-4 mr-2" /> Add Discount Slab
                  </Button>
                )}
                
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-2 pb-12">
              <Button
                type="submit"
                disabled={isSubmitting || slabs.length === 0}
                className="text-white font-medium px-8 py-6 text-base rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                style={{backgroundColor: 'var(--dashboard-primary)'}}
              >
                {isSubmitting ? "Saving..." : "Save Discount Tiers"}
                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
