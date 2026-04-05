import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
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
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
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
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/myproducts">← My Products</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground truncate flex-1">{p.name}</span>
          <MessagesSheet productId={p.id} userId={user.id} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Hero section */}
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Image */}
          <div className="sm:w-72 md:w-80 sm:shrink-0">
            {primaryImage ? (
              <div className="relative w-full max-w-md mx-auto sm:mx-0 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-muted/70 ring-1 ring-border shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto sm:mx-0 aspect-4/3 sm:aspect-square rounded-2xl bg-muted/70 flex items-center justify-center ring-1 ring-border shadow-sm">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${p.name} ${i + 1}`}
                    loading="lazy"
                    className="h-16 w-16 rounded-xl object-cover shrink-0 ring-1 ring-border bg-muted/60 opacity-85 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{p.category}</p>
              <h1 className="text-2xl font-semibold leading-tight">{p.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={availabilityColor(p.availability_status)}>
                {p.availability_status.replace(/_/g, " ")}
              </Badge>
              <Badge variant={p.is_approved ? "default" : "outline"}>
                {p.is_approved ? "Approved" : "Pending approval"}
              </Badge>
              <Badge variant={p.is_listed ? "secondary" : "outline"}>
                {p.is_listed ? "Listed" : "Unlisted"}
              </Badge>
            </div>

            <div className="text-3xl font-bold">
              ₹{Number(p.price_per_unit).toLocaleString("en-IN")}
              <span className="text-base font-normal text-muted-foreground ml-1">
                / {p.unit_type}
              </span>
            </div>

            {p.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-semibold mt-0.5">
                  {p.available_quantity} {p.unit_type}
                </p>
              </div>
              {p.min_order_quantity != null && (
                <div className="rounded-lg bg-muted/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Min. order</p>
                  <p className="font-semibold mt-0.5">
                    {p.min_order_quantity} {p.unit_type}
                  </p>
                </div>
              )}
              {p.lead_time_days != null && (
                <div className="rounded-lg bg-muted/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Lead time</p>
                  <p className="font-semibold mt-0.5">
                    {p.lead_time_days} day{p.lead_time_days !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {origin && (
                <div className="rounded-lg bg-muted/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Origin</p>
                  <p className="font-semibold mt-0.5 truncate">{origin}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing & Stock</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Origin & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
              {origin && <DetailRow label="Origin" value={origin} />}
              {p.source_name && <DetailRow label="Source" value={p.source_name} />}
              {p.packing_type && <DetailRow label="Packing type" value={p.packing_type} />}
              {p.storage_type && <DetailRow label="Storage type" value={p.storage_type} />}
              {p.transport_mode && <DetailRow label="Transport mode" value={p.transport_mode} />}
            </CardContent>
          </Card>

          {/* Quality & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
              {p.quality_grade && <DetailRow label="Quality grade" value={p.quality_grade} />}
              {p.certification && <DetailRow label="Certification" value={p.certification} />}
              <DetailRow
                label="Test report"
                value={p.test_report_available ? "Available" : "Not available"}
              />
            </CardContent>
          </Card>

          {/* Listing info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listing Info</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
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
              <DetailRow
                label="Product ID"
                value={<span className="font-mono text-xs">{p.id}</span>}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dynamic attributes */}
        {dynamicEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Attributes</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pt-0">
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
  )
}
