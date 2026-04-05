import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  packing_type: string | null
  storage_type: string | null
  transport_mode: string | null
  certification: string | null
  lead_time_days: number | null
  image_urls: string | null
  listed_at: string | null
}

function availabilityColor(status: string) {
  if (status === "in_stock") return "default"
  if (status === "low_stock") return "outline"
  return "destructive"
}

export default async function MyProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("supplier_id", user.id)
    .order("listed_at", { ascending: false })

  if (error) {
    return (
      <div className="p-8 text-destructive">
        Failed to load products: {error.message}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Products</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {products?.length ?? 0} product{products?.length !== 1 ? "s" : ""} listed
        </p>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No products listed yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products as Product[]).map((product) => {
            const firstImage = product.image_urls?.split(",")[0]?.trim()

            return (
              <Link key={product.id} href={`/myproducts/${product.id}`} className="block h-full">
              <Card className="group h-full overflow-hidden hover:ring-2 hover:ring-primary/40 transition-shadow">
                {firstImage ? (
                  <div className="relative w-full aspect-16/10 overflow-hidden bg-muted/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-16/10 bg-muted/60 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">No image</span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      ₹{Number(product.price_per_unit).toLocaleString("en-IN")}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {product.unit_type}
                      </span>
                    </span>
                    <Badge variant={availabilityColor(product.availability_status)}>
                      {product.availability_status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Qty available:{" "}
                      <span className="text-foreground font-medium">
                        {product.available_quantity} {product.unit_type}
                      </span>
                    </div>
                    {product.min_order_quantity && (
                      <div>
                        Min order:{" "}
                        <span className="text-foreground font-medium">
                          {product.min_order_quantity} {product.unit_type}
                        </span>
                      </div>
                    )}
                    {(product.origin_state || product.origin_country) && (
                      <div>
                        Origin:{" "}
                        <span className="text-foreground font-medium">
                          {[product.origin_district, product.origin_state, product.origin_country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {product.lead_time_days != null && (
                      <div>
                        Lead time:{" "}
                        <span className="text-foreground font-medium">
                          {product.lead_time_days} day{product.lead_time_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.quality_grade && (
                      <Badge variant="secondary">{product.quality_grade}</Badge>
                    )}
                    {product.certification && (
                      <Badge variant="secondary">{product.certification}</Badge>
                    )}
                    {product.packing_type && (
                      <Badge variant="outline">{product.packing_type}</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between text-xs text-muted-foreground">
                  <span>
                    {product.is_approved ? "Approved" : "Pending approval"}
                  </span>
                  <span>
                    {product.is_listed ? "Listed" : "Unlisted"}
                  </span>
                </CardFooter>
              </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
