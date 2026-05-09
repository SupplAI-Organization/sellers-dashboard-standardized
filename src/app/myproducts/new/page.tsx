"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { AppSidebar } from "@/components/AppSidebar"
import { AppTopbar } from "@/components/Apptopbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"

export default function NewProductPage() {
  const [form, setForm] = useState({
    description: "",
    max_discount: "",
    bot_customization: "",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (imageFiles.length + files.length > 5) {
      setImageError("Maximum 5 images allowed")
      return
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    setImageError(null)
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("Form submitted:", form, imageFiles)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden w-full">
      <AppTopbar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden w-full">
        <AppSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 w-full flex flex-col items-center">
          <div className="w-full max-w-3xl pb-16 pt-4">
            {/* Header */}
            <div className="mb-8 w-full block">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-4 -ml-3 text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <Link href="/myproducts">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight" style={{color: 'var(--dashboard-primary)'}}>Create New Product</h1>
                <p style={{color: 'var(--dashboard-text-muted)'}}>
                  Add product details and customize your bot
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 opacity-90"></div>
                <CardHeader className="pb-4 border-b border-neutral-100 pt-6">
                  <CardTitle className="text-xl" style={{color: 'var(--dashboard-primary)'}}>Product Details</CardTitle>
                  <CardDescription style={{color: 'var(--dashboard-text-muted)'}}>Fill in the details below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                      Write Product Description <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Write product description..."
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 resize-none transition-colors"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_discount" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                      Maximum Allowed Discount <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="max_discount"
                      name="max_discount"
                      placeholder="e.g., 10%"
                      value={form.max_discount}
                      onChange={handleChange}
                      className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bot_customization" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                      Customize Your Bot <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Textarea
                      id="bot_customization"
                      name="bot_customization"
                      placeholder="Customize your bot... e.g. Always answer politely."
                      value={form.bot_customization}
                      onChange={handleChange}
                      rows={5}
                      className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 resize-none transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Images Card */}
              <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 opacity-90"></div>
                <CardHeader className="pb-4 border-b border-neutral-100 pl-8">
                  <CardTitle className="text-xl" style={{color: 'var(--dashboard-primary)'}}>Product Images</CardTitle>
                  <CardDescription style={{color: 'var(--dashboard-text-muted)'}}>Upload up to 5 product images (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 pl-8">
                  <div>
                    <Label className="text-sm font-medium block mb-3" style={{color: 'var(--dashboard-primary)'}}>
                      Upload Images
                    </Label>
                    <div className="relative group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelection}
                        disabled={imageFiles.length >= 5}
                        className="hidden"
                        id="image-input"
                      />
                      <label
                        htmlFor="image-input"
                        className={`flex flex-col items-center justify-center w-full py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'group-hover:bg-yellow-50/50 group-hover:border-yellow-400'}`}
                        style={{
                          borderColor: imageFiles.length > 0 ? '#e5e5e5' : '#e5e5e5',
                          backgroundColor: imageFiles.length > 0 ? '#ffffff' : '#fafafa',
                        }}
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-neutral-500 group-hover:text-yellow-500 transition-colors">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium" style={{color: 'var(--dashboard-primary)'}}>
                          Click to upload images
                        </p>
                        <p className="text-xs mt-1" style={{color: 'var(--dashboard-text-muted)'}}>
                          {imageFiles.length}/5 images added
                        </p>
                      </label>
                    </div>
                    {imageError && (
                      <p className="text-sm mt-2 font-medium text-red-500 bg-red-50 py-1.5 px-3 rounded-md inline-block">{imageError}</p>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-3" style={{color: 'var(--dashboard-primary)'}}>
                        Selected Images ({imagePreviews.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-neutral-200 group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end pt-4 pb-8">
                <Button
                  variant="outline"
                  asChild
                  className="px-6 font-medium border-neutral-200 text-neutral-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <Link href="/myproducts">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="text-white font-medium px-8 shadow-sm hover:opacity-90 transition-opacity rounded-lg"
                  style={{backgroundColor: 'var(--dashboard-primary)'}}
                >
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
