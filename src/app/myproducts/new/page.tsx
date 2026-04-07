"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, X, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price_per_unit: "",
    unit_type: "kg",
    available_quantity: "",
    min_order_quantity: "",
    quality_grade: "",
    certification: "",
    origin_country: "India",
    origin_state: "",
    origin_district: "",
    lead_time_days: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  function handleImageSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (imageFiles.length + files.length > 5) {
      setError("Maximum 5 images allowed")
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
    setError(null)
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Session expired. Please sign in again.")
        setLoading(false)
        return
      }

      // Validate form
      if (!form.name || !form.category || !form.price_per_unit || !form.available_quantity) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Upload images to storage
      let imageUrls: string[] = []
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file)

        if (uploadError) {
          setError(`Failed to upload image: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName)
        
        if (data?.publicUrl) {
          imageUrls.push(data.publicUrl)
        }
      }

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          supplier_id: user.id,
          name: form.name,
          category: form.category,
          description: form.description || null,
          price_per_unit: parseFloat(form.price_per_unit),
          unit_type: form.unit_type,
          available_quantity: parseInt(form.available_quantity),
          min_order_quantity: form.min_order_quantity ? parseInt(form.min_order_quantity) : null,
          quality_grade: form.quality_grade || null,
          certification: form.certification || null,
          origin_country: form.origin_country,
          origin_state: form.origin_state || null,
          origin_district: form.origin_district || null,
          lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days) : null,
          is_listed: true,
          is_approved: false,
          availability_status: "in_stock",
          dynamic_attributes: {},
          image_urls: imageUrls.length > 0 ? imageUrls.join(",") : null,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push("/myproducts")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  const isFormValid = form.name && form.category && form.price_per_unit && form.available_quantity

  return (
    <div className="min-h-screen py-8 px-4" style={{backgroundColor: '#F4EBD3'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="mb-4"
            style={{color: '#1B3C53'}}
          >
            <Link href="/myproducts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight" style={{color: '#1B3C53'}}>Create New Product</h1>
            <p className="text-lg" style={{color: '#1B3C53'}}>
              Add a new product listing to your catalog and start reaching buyers
            </p>
          </div>
        </div>

        {error && (
          <Alert 
            className="mb-6"
            style={{backgroundColor: '#FFE6E6', borderColor: '#D2C1B6', color: '#1B3C53'}}
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2 text-sm">{error}</AlertDescription>
          </Alert>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6'}} className="shadow-lg">
          <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6'}} className="border-b">
            <CardTitle className="text-xl" style={{color: '#1B3C53'}}>📋 Basic Information</CardTitle>
            <CardDescription style={{color: '#1B3C53'}}>Essential product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                Product Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Premium Basmati Rice"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="category" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Category <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g., Rice"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
              <div>
                <Label htmlFor="unit_type" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Unit Type
                </Label>
                <select
                  id="unit_type"
                  name="unit_type"
                  value={form.unit_type}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 text-slate-800 rounded-md focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6', border: '1px solid'}}>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                  <option value="bag">Bag</option>
                  <option value="box">Box</option>
                  <option value="carton">Carton</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your product in detail..."
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 resize-none"
                style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock Card */}
        <Card style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6'}} className="shadow-lg">
          <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6'}} className="border-b">
            <CardTitle className="text-xl" style={{color: '#1B3C53'}}>💰 Pricing & Stock</CardTitle>
            <CardDescription style={{color: '#1B3C53'}}>Set your prices and available quantities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="price_per_unit" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Price per Unit (₹) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="price_per_unit"
                  name="price_per_unit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price_per_unit}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
              <div>
                <Label htmlFor="available_quantity" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Available Quantity <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="available_quantity"
                  name="available_quantity"
                  type="number"
                  placeholder="0"
                  value={form.available_quantity}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="min_order_quantity" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Minimum Order Quantity
                </Label>
                <Input
                  id="min_order_quantity"
                  name="min_order_quantity"
                  type="number"
                  placeholder="0"
                  value={form.min_order_quantity}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
              <div>
                <Label htmlFor="lead_time_days" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Lead Time (Days)
                </Label>
                <Input
                  id="lead_time_days"
                  name="lead_time_days"
                  type="number"
                  placeholder="0"
                  value={form.lead_time_days}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality & Origin Card */}
        <Card style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6'}} className="shadow-lg">
          <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6'}} className="border-b">
            <CardTitle className="text-xl" style={{color: '#1B3C53'}}>✨ Quality & Origin</CardTitle>
            <CardDescription style={{color: '#1B3C53'}}>Product quality and origin information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="quality_grade" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Quality Grade
                </Label>
                <Input
                  id="quality_grade"
                  name="quality_grade"
                  placeholder="e.g., A Grade"
                  value={form.quality_grade}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
              <div>
                <Label htmlFor="certification" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Certification
                </Label>
                <Input
                  id="certification"
                  name="certification"
                  placeholder="e.g., ISO 9001"
                  value={form.certification}
                  onChange={handleChange}
                  disabled={loading}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
            </div>

            <Separator style={{borderTopColor: '#D2C1B6'}} />

            <div className="space-y-4">
              <h4 className="font-semibold text-base" style={{color: '#1B3C53'}}>📍 Origin Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="origin_country" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                    Country
                  </Label>
                  <select
                    id="origin_country"
                    name="origin_country"
                    value={form.origin_country}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 text-slate-800 rounded-md focus:ring-offset-0"
                    style={{backgroundColor: '#fff', borderColor: '#D2C1B6', border: '1px solid'}}
                  >
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="origin_state" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                    State
                  </Label>
                  <Input
                    id="origin_state"
                    name="origin_state"
                    placeholder="State"
                    value={form.origin_state}
                    onChange={handleChange}
                    disabled={loading}
                    className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                    style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                  />
                </div>
                <div>
                  <Label htmlFor="origin_district" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                    District
                  </Label>
                  <Input
                    id="origin_district"
                    name="origin_district"
                    placeholder="District"
                    value={form.origin_district}
                    onChange={handleChange}
                    disabled={loading}
                    className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                    style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images Card */}
        <Card style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6'}} className="shadow-lg">
          <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6'}} className="border-b">
            <CardTitle className="text-xl" style={{color: '#1B3C53'}}>📸 Product Images</CardTitle>
            <CardDescription style={{color: '#1B3C53'}}>Upload up to 5 product images (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div>
              <Label className="text-sm font-semibold block mb-3" style={{color: '#1B3C53'}}>
                Upload Images
              </Label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelection}
                  disabled={loading || imageFiles.length >= 5}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="flex flex-col items-center justify-center w-full py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-opacity-50"
                  style={{
                    borderColor: '#D2C1B6',
                    backgroundColor: imageFiles.length > 0 ? '#ffffff' : '#f9f7f4',
                  }}
                >
                  <Upload className="h-10 w-10 mb-2" style={{color: '#456882'}} />
                  <p className="text-sm font-medium" style={{color: '#1B3C53'}}>
                    Click to upload images
                  </p>
                  <p className="text-xs" style={{color: '#999'}}>
                    {imageFiles.length}/5 images added
                  </p>
                </label>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3" style={{color: '#1B3C53'}}>
                  Selected Images ({imagePreviews.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden ring-1"
                      style={{backgroundColor: '#f5f5f5', borderColor: '#D2C1B6'}}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
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
        <div className="flex gap-4 justify-end pt-2">
          <Button 
            variant="outline" 
            asChild 
            disabled={loading}
            className="px-6"
            style={{borderColor: '#D2C1B6', color: '#1B3C53'}}
          >
            <Link href="/myproducts">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="text-white font-semibold px-8 shadow-lg"
            style={{backgroundColor: '#1B3C53'}}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creating Product...
              </>
            ) : (
              <>
                ✓ Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  </div>
  )
}
