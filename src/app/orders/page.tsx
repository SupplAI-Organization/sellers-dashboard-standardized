import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Printer, ShoppingCart, Clock, CheckCircle, TrendingUp } from "lucide-react"
import OrdersClient from "./orders-client"

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

        {/* Orders List */}
        <OrdersClient initialOrders={enrichedOrders} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
