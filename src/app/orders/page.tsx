import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Printer, ShoppingCart, Clock, CheckCircle, TrendingUp } from "lucide-react"

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product_name?: string
  product_unit_type?: string
  product_price_per_unit?: number
}

interface BuyerDetails {
  id: string
  contact_person: string | null
  email: string | null
  contact_number?: string | null
  business_address?: string | null
  business_name?: string | null
}

interface Order {
  id: string
  supplier_id: string
  buyer_id: string
  quantity: number
  total_price: number
  order_date: string
  payment_method: string
  status: string
  items?: OrderItem[]
  buyers?: BuyerDetails
  products?: {
    name: string
  }
  calculatedTotalPrice?: number
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

  console.log("Current user ID:", user.id)

  // Fetch orders for the current supplier
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("supplier_id", user.id)
    .order("order_date", { ascending: false })

  console.log("Orders query error:", error)
  console.log("Orders found:", orders?.length)

  if (error) {
    return (
      <div className="p-8 text-destructive">
        Failed to load orders: {error.message}
      </div>
    )
  }

  const ordersData = (orders || []) as Order[]

  // Fetch order items for all orders
  const orderIds = ordersData.map(o => o.id).filter(Boolean)
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds.length > 0 ? orderIds : [""])

  // Fetch product info for all order items (with more details)
  const productIds = [...new Set((orderItems || []).map(oi => oi.product_id).filter(Boolean))]
  const { data: productsMap } = await supabase
    .from("products")
    .select("id, name, unit_type, price_per_unit, available_quantity")
    .in("id", productIds.length > 0 ? productIds : [""])

  // Fetch buyer info for each order
  const buyerIds = [...new Set(ordersData.map(o => o.buyer_id).filter(Boolean))]
  
  // Buyers are stored in the users table (referenced by buyer_id)
  const { data: buyersFromUsers } = await supabase
    .from("users")
    .select("*")
    .in("id", buyerIds.length > 0 ? buyerIds : [""])

  // Create index maps for quick lookup
  const productsIndex = new Map((productsMap || []).map(p => [p.id, p]))
  const buyersIndex = new Map<string, BuyerDetails>()
  
  // Use users table data for buyers
  ;(buyersFromUsers || []).forEach(b => {
    buyersIndex.set(b.id, b as BuyerDetails)
  })
  const itemsIndex = new Map<string, OrderItem[]>()
  
  // Group order items by order_id and enrich with product names and details
  ;(orderItems || []).forEach(item => {
    const product = productsIndex.get(item.product_id)
    const enrichedItem = {
      ...item,
      product_name: product?.name || "Product",
      product_unit_type: product?.unit_type || "unit",
      product_price_per_unit: product?.price_per_unit
    }
    if (!itemsIndex.has(item.order_id)) {
      itemsIndex.set(item.order_id, [])
    }
    itemsIndex.get(item.order_id)?.push(enrichedItem)
  })

  // Enrich orders with items and buyer info
  const enrichedOrders = ordersData.map(order => {
    const items = itemsIndex.get(order.id) || []
    // Calculate total price based on current product prices
    const calculatedTotalPrice = items.reduce((sum, item) => {
      const unitPrice = item.product_price_per_unit || item.price_at_purchase || 0
      return sum + (unitPrice * (item.quantity || 0))
    }, 0)
    
    return {
      ...order,
      items,
      buyers: buyersIndex.get(order.buyer_id),
      calculatedTotalPrice
    }
  }) as Order[]

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
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>QUANTITY</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>UNIT</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>PRICE/UNIT</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>BUYER NAME</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>BUYER EMAIL</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>BUYER PHONE</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>ADDRESS</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>TOTAL AMOUNT</th>
                    <th className="text-left py-3 px-6 font-semibold text-xs" style={{color: '#999'}}>PAYMENT METHOD</th>
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
                          {order.items && order.items.length > 0
                            ? order.items.map(item => item.product_name).join(", ")
                            : "Product"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                          {order.items && order.items.length > 0
                            ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                            : 0}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm" style={{color: '#1B3C53'}}>
                          {order.items && order.items.length > 0
                            ? order.items.map(item => item.product_unit_type || "unit").join(", ")
                            : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold" style={{color: '#1B3C53'}}>
                          {order.items && order.items.length > 0
                            ? "₹" + order.items.map(item => Number(item.product_price_per_unit || item.price_at_purchase)).join(", ")
                            : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium" style={{color: '#1B3C53'}}>
                          {order.buyers?.contact_person || "Unknown"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs" style={{color: '#1B3C53'}}>
                          {order.buyers?.email || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs" style={{color: '#1B3C53'}}>
                          {order.buyers?.contact_number || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs" style={{color: '#1B3C53'}}>
                          {order.buyers?.business_address ? order.buyers.business_address.substring(0, 30) : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold" style={{color: '#1B3C53'}}>
                          ₹{Number(order.calculatedTotalPrice || order.total_price).toLocaleString("en-IN")}
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
