"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { AppSidebar } from "@/components/AppSidebar"
import { AppTopbar } from "@/components/Apptopbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, X, PackageOpen, Globe, Truck, Sparkles, ImagePlus } from "lucide-react"

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price_per_unit: "",
    unit_type: "",
    available_quantity: "",
    minimum_order_quantity: "",
    max_discount: "",
    origin_country: "",
    origin_state: "",
    origin_district: "",
    source_name: "",
    quality_grade: "",
    certification: "",
    test_report_available: false,
    packing_type: "loose",
    storage_type: "warehouse",
    transport_mode: "truck",
    lead_time_days: "",
    reorder_threshold: "",
    availability_status: "in_stock",
    is_listed: false,
    is_approved: false,
    dynamic_attributes: "",
    bot_customization: "",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [userName, setUserName] = useState("Seller");
  const [userEmail, setUserEmail] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setSupplierId(user.id); // Set the supplier_id from the authenticated user
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target;
    const name = target.name;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supplierId) {
      alert("Error: Supplier context not found. Please re-login.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format numeric fields properly before inserting to Supabase
      const productPayload = {
        ...form,
        supplier_id: supplierId,
        price_per_unit: form.price_per_unit ? parseFloat(form.price_per_unit) : null,
        available_quantity: form.available_quantity ? parseInt(form.available_quantity) : null,
        minimum_order_quantity: form.minimum_order_quantity ? parseInt(form.minimum_order_quantity) : null,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days) : null,
        reorder_threshold: form.reorder_threshold ? parseInt(form.reorder_threshold) : null,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productPayload])
        .select();

      if (error) {
        console.error("Supabase Error:", error);
        alert(`Failed to create product: ${error.message}`);
        return;
      }

      alert("Product created successfully!");
      router.push("/myproducts");
    } catch (err) {
      console.error("Submission Error:", err);
      alert("An unexpected error occurred while creating the product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden w-full">
      <AppTopbar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden w-full">
        <AppSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 w-full flex flex-col items-center">
          <div className="w-full max-w-4xl pb-20 pt-6">
            {/* Header */}
            <div className="mb-10 w-full block">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mb-6 rounded-xl border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-all hover:bg-white shadow-sm hover:shadow"
              >
                <Link href="/myproducts">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center">
                  <PackageOpen className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Create New Product</h1>
                  <p className="text-base font-medium" style={{color: 'var(--dashboard-text-muted)'}}>
                    Add comprehensive product details, sourcing info, and customize your bot
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
              {/* Card 1: Basic Details */}
              <Card className="rounded-2xl border border-neutral-100 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(250,204,21,0.5)] flex"></div>
                <CardHeader className="pb-4 border-b border-neutral-50 pt-6 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-neutral-100 shadow-sm rounded-xl text-yellow-500"><PackageOpen className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-lg font-extrabold" style={{color: 'var(--dashboard-primary)'}}>Basic Details</CardTitle>
                      <CardDescription className="text-sm font-medium mt-0.5" style={{color: 'var(--dashboard-text-muted)'}}>Core information about the product</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Name of the Product <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input id="name" name="name" placeholder="e.g. Premium Cotton" value={form.name} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Category <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input id="category" name="category" placeholder="e.g. Raw Materials" value={form.category} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>

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
                      rows={4}
                      className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 resize-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="price_per_unit" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Price Per Unit <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input type="number" step="0.01" id="price_per_unit" name="price_per_unit" placeholder="e.g., 500" value={form.price_per_unit} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="unit_type" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Unit Type <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input id="unit_type" name="unit_type" placeholder="e.g. kg, ton, piece" value={form.unit_type} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Label htmlFor="available_quantity" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Available Quantity <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input type="number" id="available_quantity" name="available_quantity" placeholder="e.g. 1000" value={form.available_quantity} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="minimum_order_quantity" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Min Order Quantity (MOQ) <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                      <Input type="number" id="minimum_order_quantity" name="minimum_order_quantity" placeholder="e.g. 50" value={form.minimum_order_quantity} onChange={handleChange} required className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="max_discount" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                        Max Allowed Discount (%)
                      </Label>
                      <Input id="max_discount" name="max_discount" placeholder="e.g., 10" value={form.max_discount} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Sourcing & Origin */}
              <Card className="rounded-2xl border border-neutral-100 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(250,204,21,0.5)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 opacity-20"></div>
                <CardHeader className="pb-4 border-b border-neutral-50 pt-6 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border border-neutral-100 shadow-sm rounded-xl text-yellow-600"><Globe className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-lg font-extrabold" style={{color: 'var(--dashboard-primary)'}}>Sourcing & Origin</CardTitle>
                      <CardDescription className="text-sm font-medium mt-0.5" style={{color: 'var(--dashboard-text-muted)'}}>Where and how the product originates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="origin_country" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Origin Country</Label>
                      <Input id="origin_country" name="origin_country" placeholder="e.g. India" value={form.origin_country} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="origin_state" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Origin State</Label>
                      <Input id="origin_state" name="origin_state" placeholder="e.g. Gujarat" value={form.origin_state} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="origin_district" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Origin District/Region</Label>
                      <Input id="origin_district" name="origin_district" placeholder="e.g. Surat" value={form.origin_district} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="source_name" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Source Name</Label>
                      <Input id="source_name" name="source_name" placeholder="e.g. XYZ Farm, ABC Mine" value={form.source_name} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="quality_grade" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Quality Grade</Label>
                      <Input id="quality_grade" name="quality_grade" placeholder="e.g. Grade A, 99% Purity" value={form.quality_grade} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="certification" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Certifications</Label>
                    <Input id="certification" name="certification" placeholder="e.g. ISO 9001, Organic Certified" value={form.certification} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                  </div>
                  
                  <div className="flex items-center space-x-3 pt-2">
                    <input type="checkbox" id="test_report_available" name="test_report_available" checked={form.test_report_available} onChange={handleChange} className="h-5 w-5 rounded border-neutral-300 text-yellow-500 focus:ring-yellow-400" />
                    <Label htmlFor="test_report_available" className="text-sm font-medium cursor-pointer" style={{color: 'var(--dashboard-primary)'}}>Test/Lab Report Available</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Logistics & Storage */}
              <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 opacity-90"></div>
                <CardHeader className="pb-4 border-b border-neutral-100 pt-6">
                  <CardTitle className="text-xl" style={{color: 'var(--dashboard-primary)'}}>Logistics & Storage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Label htmlFor="packing_type" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Packing Type</Label>
                      <select id="packing_type" name="packing_type" value={form.packing_type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 transition-colors">
                        <option value="loose">Loose</option>
                        <option value="bags">Bags</option>
                        <option value="bales">Bales</option>
                        <option value="jumbo_bags">Jumbo Bags</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="storage_type" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Storage Type</Label>
                      <select id="storage_type" name="storage_type" value={form.storage_type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 transition-colors">
                        <option value="open">Open</option>
                        <option value="covered">Covered</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="transport_mode" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Transport Mode</Label>
                      <select id="transport_mode" name="transport_mode" value={form.transport_mode} onChange={handleChange} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 transition-colors">
                        <option value="truck">Truck</option>
                        <option value="rail">Rail</option>
                        <option value="ship">Ship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="lead_time_days" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Lead Time (Days before dispatch)</Label>
                      <Input type="number" id="lead_time_days" name="lead_time_days" placeholder="e.g. 5" value={form.lead_time_days} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="reorder_threshold" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Reorder Threshold (Min stock alert)</Label>
                      <Input type="number" id="reorder_threshold" name="reorder_threshold" placeholder="e.g. 100" value={form.reorder_threshold} onChange={handleChange} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Visibility & Bot */}
              <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 opacity-90"></div>
                <CardHeader className="pb-4 border-b border-neutral-100 pt-6">
                  <CardTitle className="text-xl" style={{color: 'var(--dashboard-primary)'}}>Visibility & Customization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Label htmlFor="availability_status" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Availability Status</Label>
                      <select id="availability_status" name="availability_status" value={form.availability_status} onChange={handleChange} className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus-visible:ring-1 focus-visible:ring-yellow-400 focus:border-yellow-400 transition-colors">
                        <option value="in_stock">In Stock</option>
                        <option value="limited">Limited</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-8">
                      <input type="checkbox" id="is_listed" name="is_listed" checked={form.is_listed} onChange={handleChange} className="h-5 w-5 rounded border-neutral-300 text-yellow-500 focus:ring-yellow-400" />
                      <Label htmlFor="is_listed" className="text-sm font-medium cursor-pointer" style={{color: 'var(--dashboard-primary)'}}>Is Listed</Label>
                    </div>

                    <div className="flex items-center space-x-3 pt-8">
                      <input type="checkbox" id="is_approved" name="is_approved" checked={form.is_approved} onChange={handleChange} className="h-5 w-5 rounded border-neutral-300 text-yellow-500 focus:ring-yellow-400" />
                      <Label htmlFor="is_approved" className="text-sm font-medium cursor-pointer" style={{color: 'var(--dashboard-primary)'}}>Is Approved</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dynamic_attributes" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>Dynamic Attributes (JSON/Text)</Label>
                    <Textarea id="dynamic_attributes" name="dynamic_attributes" placeholder="Key-value pairs or additional specs..." value={form.dynamic_attributes} onChange={handleChange} rows={3} className="text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-yellow-400 border-neutral-200 resize-none transition-colors" />
                  </div>

                  <div>
                    <Label htmlFor="bot_customization" className="text-sm font-medium block mb-2" style={{color: 'var(--dashboard-primary)'}}>
                      Customize Your Bot
                    </Label>
                    <Textarea
                      id="bot_customization"
                      name="bot_customization"
                      placeholder="Customize your bot... e.g. Always answer politely."
                      value={form.bot_customization}
                      onChange={handleChange}
                      rows={4}
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
                  type="button"
                  onClick={() => router.push("/myproducts")}
                  disabled={isSubmitting}
                  className="px-6 font-medium border-neutral-200 text-neutral-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white font-medium px-8 shadow-sm hover:opacity-90 transition-opacity rounded-lg"
                  style={{backgroundColor: 'var(--dashboard-primary)'}}
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
