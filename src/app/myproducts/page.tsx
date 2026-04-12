import { redirect } from "next/navigation"
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
import { Plus, Package, Edit, Eye, Trash2 } from "lucide-react"

type Product = {
  id: string
  name: string
  category: string
  description: string | null
  price_per_unit: number
  unit_type: string
  available_quantity: number
  is_listed: boolean | null
  is_approved: boolean | null
  availability_status: string
  listed_at: string | null
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
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto space-y-6 py-8 px-4 md:px-8" style={{backgroundColor: '#F9E7B2'}}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{color: '#1B3C53'}}>My Products</h1>
            <p className="text-sm" style={{color: '#666'}}>
              Manage and track all your product listings
            </p>
          </div>
          <Button asChild size="lg" className="text-white font-semibold shadow-md" style={{backgroundColor: '#1B3C53'}}>
            <Link href="/myproducts/new">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card style={{backgroundColor: '#ffffff'}} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" style={{color: '#1B3C53'}}>{products?.length ?? 0}</div>
            <p className="text-xs mt-1" style={{color: '#666'}}>Total Products</p>
          </CardContent>
        </Card>
        <Card style={{backgroundColor: '#ffffff'}} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" style={{color: '#1B3C53'}}>
              {products?.filter(p => p.is_listed).length ?? 0}
            </div>
            <p className="text-xs mt-1" style={{color: '#666'}}>Listed</p>
          </CardContent>
        </Card>
        <Card style={{backgroundColor: '#ffffff'}} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" style={{color: '#1B3C53'}}>
              {products?.filter(p => p.is_approved).length ?? 0}
            </div>
            <p className="text-xs mt-1" style={{color: '#666'}}>Approved</p>
          </CardContent>
        </Card>
        <Card style={{backgroundColor: '#ffffff'}} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" style={{color: '#1B3C53'}}>
              {products?.filter(p => p.availability_status === "in_stock").length ?? 0}
            </div>
            <p className="text-xs mt-1" style={{color: '#666'}}>In Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card style={{backgroundColor: '#ffffff', borderColor: '#D2C1B6'}}>
        <CardHeader style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="border-b">
          <CardTitle style={{color: '#1B3C53'}}>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="h-12 w-12 mb-3" style={{color: '#1B3C53'}} />
              <h3 className="text-lg font-semibold mb-2" style={{color: '#1B3C53'}}>No products yet</h3>
              <p style={{color: '#666'}} className="mb-4">Start selling by adding your first product</p>
              <Button asChild size="sm" className="text-white" style={{backgroundColor: '#1B3C53'}}>
                <Link href="/myproducts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{backgroundColor: '#F9E7B2', borderBottomColor: '#D2C1B6'}} className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Product Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(products as Product[]).map((product) => (
                    <tr 
                      key={product.id} 
                      style={{borderBottomColor: '#D2C1B6'}} 
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Link href={`/myproducts/${product.id}`} className="hover:underline">
                          <div className="font-medium text-sm" style={{color: '#1B3C53'}}>{product.name}</div>
                          <div className="text-xs" style={{color: '#999'}}>ID: {product.id.substring(0, 8)}</div>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-sm" style={{color: '#666'}}>{product.category}</td>
                      <td className="py-4 px-4 text-sm font-semibold" style={{color: '#1B3C53'}}>₹{Number(product.price_per_unit).toLocaleString("en-IN")} / {product.unit_type}</td>
                      <td className="py-4 px-4 text-sm">
                        <div className="font-semibold" style={{color: '#1B3C53'}}>{product.available_quantity}</div>
                        <div className="text-xs" style={{color: '#999'}}>{product.unit_type}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {product.is_approved ? (
                            <Badge style={{backgroundColor: '#F9E7B2', color: '#1B3C53'}} className="text-xs">Approved</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                          {product.is_listed ? (
                            <Badge style={{backgroundColor: '#F9E7B2', color: '#1B3C53'}} className="text-xs">Listed</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Unlisted</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/myproducts/${product.id}`}>
                            <Eye className="h-4 w-4 hover:opacity-70" style={{color: '#1B3C53'}} />
                          </Link>
                          <Link href={`/myproducts/${product.id}`}>
                            <Edit className="h-4 w-4 hover:opacity-70" style={{color: '#1B3C53'}} />
                          </Link>
                          <button className="hover:opacity-70">
                            <Trash2 className="h-4 w-4" style={{color: '#1B3C53'}} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
