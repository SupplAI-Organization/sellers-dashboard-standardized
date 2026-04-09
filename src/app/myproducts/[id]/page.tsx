import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import MessagesSheet from "@/components/MessagesSheet"
import { Edit } from "lucide-react"

type Product = {
  id: string
  name: string
  category: string
  description: string | null
  price_per_unit: number
  unit_type: string
  available_quantity: number
  min_order_quantity: number | null
  is_listed: boolean | null
  is_approved: boolean | null
  availability_status: string
  quality_grade: string | null
  origin_country: string | null
  origin_state: string | null
  origin_district: string | null
  source_name: string | null
  packing_type: string | null
  storage_type: string | null
  transport_mode: string | null
  certification: string | null
  lead_time_days: number | null
  image_urls: string | null
  reorder_threshold: number | null
  test_report_available: boolean | null
  dynamic_attributes: Record<string, unknown>
  listed_at: string | null
  created_at: string | null
  updated_at: string | null
}

function availabilityColor(status: string): "default" | "outline" | "destructive" {
  if (status === "in_stock") return "default"
  if (status === "low_stock") return "outline"
  return "destructive"
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm">
      <span className="shrink-0 font-medium" style={{color: '#1B3C53'}}>{label}</span>
      <span className="text-right font-semibold" style={{color: '#1B3C53'}}>{value}</span>
    </div>
  )
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("supplier_id", user.id)
    .single()

  if (error || !product) notFound()

  const p = product as Product
  const images = p.image_urls
    ? p.image_urls.split(",").map((u) => u.trim()).filter(Boolean)
    : []
  const primaryImage = images[0]

  const origin = [p.origin_district, p.origin_state, p.origin_country]
    .filter(Boolean)
    .join(", ")

  const dynamicEntries = p.dynamic_attributes
    ? Object.entries(p.dynamic_attributes)
    : []

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto" style={{backgroundColor: '#F9E7B2'}}>
        <div style={{backgroundColor: '#ffffff'}}>
          {/* Header bar */}
          <div style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="border-b shadow-sm">
            <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-3 text-sm">
                <Link href="/myproducts" className="hover:underline font-medium" style={{color: '#1B3C53'}}>My Products</Link>
                <span style={{color: '#1B3C53'}}>/</span>
                <span className="font-semibold" style={{color: '#1B3C53'}}>{p.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 py-8 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b" style={{borderBottomColor: '#D2C1B6'}}>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2" style={{color: '#1B3C53'}}>
            <Link href="/myproducts">← Back to Products</Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight" style={{color: '#1B3C53'}}>{p.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="font-semibold" style={{borderColor: '#D2C1B6', color: '#1B3C53'}}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <MessagesSheet productId={p.id} userId={user.id} />
        </div>
      </div>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images - Left */}
        <div className="lg:col-span-1 space-y-4">
          {primaryImage ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden ring-2 shadow-lg" style={{backgroundColor: '#F5F5F5', borderColor: '#F9E7B2'}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-lg flex items-center justify-center ring-2 shadow-lg" style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6'}}>
              <span style={{color: '#1B3C53'}} className="text-sm font-semibold">No image</span>
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {images.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${p.name} ${i + 1}`}
                  loading="lazy"
                  className="h-24 w-24 rounded-lg object-cover shrink-0 ring-2 bg-slate-100 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{borderColor: '#F9E7B2', backgroundColor: '#F5F5F5'}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wider font-semibold" style={{color: '#1B3C53'}}>
              {p.category}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={availabilityColor(p.availability_status)} className="font-semibold">
                {p.availability_status.replace(/_/g, " ").toUpperCase()}
              </Badge>
              <Badge variant={p.is_approved ? "default" : "outline"} className="font-semibold">
                {p.is_approved ? "✓ APPROVED" : "PENDING"}
              </Badge>
              <Badge variant={p.is_listed ? "secondary" : "outline"} className="font-semibold">
                {p.is_listed ? "LISTED" : "UNLISTED"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1 p-5 rounded-lg" style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6', borderWidth: '2px'}}>
            <p className="text-sm font-semibold" style={{color: '#1B3C53'}}>Price per unit</p>
            <div className="text-5xl font-bold" style={{color: '#1B3C53'}}>
              ₹{Number(p.price_per_unit).toLocaleString("en-IN")}
              <span className="text-xl font-semibold ml-3" style={{color: '#1B3C53'}}>
                / {p.unit_type}
              </span>
            </div>
          </div>

          {p.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{color: '#1B3C53'}}>Description</p>
              <p style={{color: '#1B3C53'}} className="text-base leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs font-bold" style={{color: '#1B3C53'}}>AVAILABLE STOCK</p>
                <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>
                  {p.available_quantity}
                </p>
                <p className="text-xs mt-1" style={{color: '#1B3C53'}}>{p.unit_type}</p>
              </CardContent>
            </Card>

            {p.min_order_quantity != null && (
              <Card style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-sm">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold" style={{color: '#1B3C53'}}>MINIMUM ORDER</p>
                  <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>
                    {p.min_order_quantity}
                  </p>
                  <p className="text-xs mt-1" style={{color: '#1B3C53'}}>{p.unit_type}</p>
                </CardContent>
              </Card>
            )}

            {p.lead_time_days != null && (
              <Card style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-sm">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold" style={{color: '#1B3C53'}}>LEAD TIME</p>
                  <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>{p.lead_time_days}</p>
                  <p className="text-xs mt-1" style={{color: '#1B3C53'}}>days</p>
                </CardContent>
              </Card>
            )}

            {origin && (
              <Card style={{backgroundColor: '#F9E7B2', borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-sm">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold" style={{color: '#1B3C53'}}>ORIGIN</p>
                  <p className="text-sm font-bold mt-2 truncate" style={{color: '#1B3C53'}}>{origin}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Detail cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pricing & Stock */}
        <Card style={{borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-md">
          <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="pb-3 border-b">
            <CardTitle className="text-base font-bold" style={{color: '#1B3C53'}}>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0" style={{borderColor: '#D2C1B6'}}>
            <DetailRow
              label="Price per unit"
              value={`₹${Number(p.price_per_unit).toLocaleString("en-IN")} / ${p.unit_type}`}
            />
            <DetailRow
              label="Available quantity"
              value={`${p.available_quantity} ${p.unit_type}`}
            />
            {p.min_order_quantity != null && (
              <DetailRow
                label="Min. order quantity"
                value={`${p.min_order_quantity} ${p.unit_type}`}
              />
            )}
            {p.reorder_threshold != null && (
              <DetailRow
                label="Reorder threshold"
                value={`${p.reorder_threshold} ${p.unit_type}`}
              />
            )}
            {p.lead_time_days != null && (
              <DetailRow
                label="Lead time"
                value={`${p.lead_time_days} day${p.lead_time_days !== 1 ? "s" : ""}`}
              />
            )}
          </CardContent>
        </Card>

        {/* Origin & Logistics */}
        <Card style={{borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-md">
          <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="pb-3 border-b">
            <CardTitle className="text-base font-bold" style={{color: '#1B3C53'}}>Origin & Logistics</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0" style={{borderColor: '#D2C1B6'}}>
            {origin && <DetailRow label="Origin" value={origin} />}
            {p.source_name && <DetailRow label="Source" value={p.source_name} />}
            {p.packing_type && <DetailRow label="Packing type" value={p.packing_type} />}
            {p.storage_type && <DetailRow label="Storage type" value={p.storage_type} />}
            {p.transport_mode && <DetailRow label="Transport mode" value={p.transport_mode} />}
          </CardContent>
        </Card>

        {/* Quality & Compliance */}
        <Card style={{borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-md">
          <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="pb-3 border-b">
            <CardTitle className="text-base font-bold" style={{color: '#1B3C53'}}>Quality & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0" style={{borderColor: '#D2C1B6'}}>
            {p.quality_grade && <DetailRow label="Quality grade" value={p.quality_grade} />}
            {p.certification && <DetailRow label="Certification" value={p.certification} />}
            <DetailRow
              label="Test report"
              value={p.test_report_available ? "✓ Available" : "Not available"}
            />
          </CardContent>
        </Card>

        {/* Listing info */}
        <Card style={{borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-md">
          <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="pb-3 border-b">
            <CardTitle className="text-base font-bold" style={{color: '#1B3C53'}}>Listing Info</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0" style={{borderColor: '#D2C1B6'}}>
            {p.listed_at && (
              <DetailRow
                label="Listed at"
                value={new Date(p.listed_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            )}
            {p.created_at && (
              <DetailRow
                label="Created"
                value={new Date(p.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            )}
            {p.updated_at && (
              <DetailRow
                label="Last updated"
                value={new Date(p.updated_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dynamic attributes */}
      {dynamicEntries.length > 0 && (
        <Card style={{borderColor: '#D2C1B6', borderWidth: '2px'}} className="shadow-md">
          <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="pb-3 border-b">
            <CardTitle className="text-base font-bold" style={{color: '#1B3C53'}}>Additional Attributes</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0" style={{borderColor: '#D2C1B6'}}>
            {dynamicEntries.map(([key, val]) => (
              <DetailRow
                key={key}
                label={key.replace(/_/g, " ")}
                value={String(val)}
              />
            ))}
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </div>
    </div>
  )
}
