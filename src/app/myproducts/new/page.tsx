"use client"

import { useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/AppSidebar"
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
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto py-8 px-4 md:px-8" style={{backgroundColor: '#F9E7B2'}}>
        {/* Header */}
        <div className="mb-8 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-3"
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
              Add product details and customize your bot
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <Card style={{backgroundColor: '#ffffff', borderColor: '#1B3C53', borderWidth: '2px'}} className="shadow-lg">
            <CardHeader className="pb-4 border-b" style={{backgroundColor: '#F9E7B2', borderBottomColor: '#1B3C53', borderBottomWidth: '2px'}}>
              <CardTitle className="text-xl" style={{color: '#1B3C53'}}>Product Details</CardTitle>
              <CardDescription style={{color: '#1B3C53'}}>Fill in the details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <Label htmlFor="description" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Write Product Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Write product description..."
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 resize-none"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>

              <div>
                <Label htmlFor="max_discount" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Maximum Allowed Discount
                </Label>
                <Input
                  id="max_discount"
                  name="max_discount"
                  placeholder="e.g., 10%"
                  value={form.max_discount}
                  onChange={handleChange}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>

              <div>
                <Label htmlFor="bot_customization" className="text-sm font-semibold block mb-2" style={{color: '#1B3C53'}}>
                  Customize Your Bot
                </Label>
                <Textarea
                  id="bot_customization"
                  name="bot_customization"
                  placeholder="Customize your bot..."
                  value={form.bot_customization}
                  onChange={handleChange}
                  rows={5}
                  className="text-slate-800 placeholder:text-slate-500 focus:ring-offset-0 resize-none"
                  style={{backgroundColor: '#fff', borderColor: '#D2C1B6'}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images Card */}
          <Card style={{backgroundColor: '#ffffff', borderColor: '#1B3C53', borderWidth: '2px'}} className="shadow-lg">
            <CardHeader className="pb-4 border-b" style={{backgroundColor: '#F9E7B2', borderBottomColor: '#1B3C53', borderBottomWidth: '2px'}}>
              <CardTitle className="text-xl" style={{color: '#1B3C53'}}>Product Images</CardTitle>
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
                    disabled={imageFiles.length >= 5}
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
                {imageError && (
                  <p className="text-sm mt-2" style={{color: '#B91C1C'}}>{imageError}</p>
                )}
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
          <div className="flex gap-4 justify-end pt-2 pb-8">
            <Button
              variant="outline"
              asChild
              className="px-6 font-semibold"
              style={{borderColor: '#1B3C53', color: '#1B3C53'}}
            >
              <Link href="/myproducts">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="text-white font-semibold px-8 shadow-lg"
              style={{backgroundColor: '#1B3C53'}}
            >
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
