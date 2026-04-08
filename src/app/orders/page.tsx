import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Printer, ShoppingCart, Clock, CheckCircle, TrendingUp } from "lucide-react"

interface Order {
  id: string
  product_id: string
  supplier_id: string
  buyer_id: string
  quantity: number
  total_price: number
  order_date: string
  payment_method: string
  status: string
  products?: {
    name: string
  }
  buyers?: {
    email: string
    full_name: string
  }
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch orders for the current supplier (without relationships if they don't exist)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("supplier_id", user.id)
    .order("order_date", { ascending: false })

  if (error) {
    return (
      <div className="p-8 text-destructive">
        Failed to load orders: {error.message}
      </div>
    )
  }

  const ordersData = (orders || []) as Order[]

  // Fetch product names for each order (if orders have product_id)
  const productIds = [...new Set(ordersData.map(o => o.product_id).filter(Boolean))]
  const { data: productsMap } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds.length > 0 ? productIds : [""])

  // Fetch buyer info for each order (if orders have buyer_id)
  const buyerIds = [...new Set(ordersData.map(o => o.buyer_id).filter(Boolean))]
  const { data: buyersMap } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", buyerIds.length > 0 ? buyerIds : [""])

  // Map products and buyers to their respective orders
  const productsIndex = new Map((productsMap || []).map(p => [p.id, p]))
  const buyersIndex = new Map((buyersMap || []).map(b => [b.id, b]))

  const enrichedOrders = ordersData.map(order => ({
    ...order,
    products: productsIndex.get(order.product_id) || { name: "Product" },
    buyers: buyersIndex.get(order.buyer_id),
  })) as Order[]

  // Calculate stats
  const totalOrders = enrichedOrders.length
  const completedOrders = enrichedOrders.filter(o => o.status === "completed" || o.status === "delivered").length
  const pendingOrders = enrichedOrders.filter(o => o.status === "pending").length
  const totalRevenue = enrichedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto" style={{backgroundColor: '#F9E7B2'}}>
        <div className="space-y-6 py-8 px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{color: '#1B3C53'}}>Orders</h1>
            <p className="text-sm" style={{color: '#666'}}>
              Manage and track all buyer orders
            </p>
          </div>
          <Button size="lg" className="text-white font-semibold shadow-md" style={{backgroundColor: '#1B3C53'}}>
            <Printer className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search orders..."
            className="px-4 py-2 rounded-lg text-sm border flex-1"
            style={{borderColor: '#D2C1B6', backgroundColor: '#ffffff'}}
          />
          <Button 
            variant="outline" 
            size="sm"
            className="font-semibold"
            style={{borderColor: '#D2C1B6', color: '#1B3C53'}}
          >
            Filter
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <div 
            className="p-4 rounded-lg shadow-sm border-l-4" 
            style={{backgroundColor: '#ffffff', borderLeftColor: '#1B3C53', borderColor: '#E5E5E5'}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{color: '#999'}}>TOTAL ORDERS</p>
                <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>{totalOrders}</p>
              </div>
              <div className="p-2 rounded-lg" style={{backgroundColor: '#F9E7B2'}}>
                <ShoppingCart className="h-6 w-6" style={{color: '#1B3C53'}} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{color: '#999'}}>All orders</p>
          </div>

          {/* Pending Orders */}
          <div 
            className="p-4 rounded-lg shadow-sm border-l-4" 
            style={{backgroundColor: '#ffffff', borderLeftColor: '#FFA500', borderColor: '#E5E5E5'}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{color: '#999'}}>PENDING</p>
                <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>{pendingOrders}</p>
              </div>
              <div className="p-2 rounded-lg" style={{backgroundColor: '#FFE5CC'}}>
                <Clock className="h-6 w-6" style={{color: '#FFA500'}} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{color: '#999'}}>Awaiting action</p>
          </div>

          {/* Completed Orders */}
          <div 
            className="p-4 rounded-lg shadow-sm border-l-4" 
            style={{backgroundColor: '#ffffff', borderLeftColor: '#22C55E', borderColor: '#E5E5E5'}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{color: '#999'}}>COMPLETED</p>
                <p className="text-3xl font-bold mt-2" style={{color: '#1B3C53'}}>{completedOrders}</p>
              </div>
              <div className="p-2 rounded-lg" style={{backgroundColor: '#D1FAE5'}}>
                <CheckCircle className="h-6 w-6" style={{color: '#22C55E'}} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{color: '#999'}}>Successfully delivered</p>
          </div>

          {/* Total Revenue */}
          <div 
            className="p-4 rounded-lg shadow-sm border-l-4" 
            style={{backgroundColor: '#ffffff', borderLeftColor: '#06B6D4', borderColor: '#E5E5E5'}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{color: '#999'}}>TOTAL REVENUE</p>
                <p className="text-2xl font-bold mt-2" style={{color: '#1B3C53'}}>₹{(totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <div className="p-2 rounded-lg" style={{backgroundColor: '#CFFAFE'}}>
                <TrendingUp className="h-6 w-6" style={{color: '#06B6D4'}} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{color: '#999'}}>Total earnings</p>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{backgroundColor: '#ffffff', borderColor: '#E5E5E5'}} className="rounded-lg border shadow-sm">
          {/* Table Header */}
          <div style={{backgroundColor: '#F9F9F9', borderBottomColor: '#E5E5E5'}} className="px-6 py-4 border-b">
            <h3 className="font-semibold text-lg" style={{color: '#1B3C53'}}>Order Details</h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {!enrichedOrders || enrichedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <ShoppingCart className="h-12 w-12 mb-3" style={{color: '#DDD'}} />
                <h3 className="text-lg font-semibold mb-2" style={{color: '#1B3C53'}}>No orders yet</h3>
                <p style={{color: '#999'}} className="mb-4">Orders from buyers will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{backgroundColor: '#F9F9F9', borderBottomColor: '#E5E5E5'}} className="border-b">
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>ORDER ID</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>PRODUCT</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>BUYER</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>QUANTITY</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>AMOUNT</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>METHOD</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>STATUS</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>DATE</th>
                    <th className="text-center py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      style={{borderBottomColor: '#E5E5E5'}} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded" style={{color: '#1B3C53'}}>
                          {order.id.substring(0, 8)}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                          {order.products?.name || "Product"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium" style={{color: '#1B3C53'}}>
                            {order.buyers?.full_name || "Unknown"}
                          </div>
                          <div className="text-xs" style={{color: '#999'}}>
                            {order.buyers?.email?.substring(0, 20)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                          {order.quantity}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold" style={{color: '#1B3C53'}}>
                          ₹{Number(order.total_price).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm" style={{color: '#1B3C53'}}>
                          {order.payment_method
                            ? order.payment_method
                              .split("_")
                              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")
                            : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge 
                          className="font-semibold text-xs"
                          style={{
                            backgroundColor: 
                              order.status === "completed" || order.status === "delivered" ? "#D1FAE5" :
                              order.status === "pending" ? "#FEF3C7" :
                              "#FEE2E2",
                            color: 
                              order.status === "completed" || order.status === "delivered" ? "#059669" :
                              order.status === "pending" ? "#D97706" :
                              "#DC2626",
                            border: "none"
                          }}
                        >
                          {statusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm" style={{color: '#1B3C53'}}>
                          {new Date(order.order_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" style={{color: '#1B3C53'}} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {enrichedOrders.length > 0 && (
            <div style={{backgroundColor: '#F9F9F9', borderTopColor: '#E5E5E5'}} className="px-6 py-3 border-t flex items-center justify-between text-sm">
              <span style={{color: '#999'}}>Showing {enrichedOrders.length} orders</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
