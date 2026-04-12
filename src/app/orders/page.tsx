import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Printer, ShoppingCart, Clock, CheckCircle, TrendingUp } from "lucide-react"
import OrdersClient from "./orders-client"

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


export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  console.log("Current user ID:", user.id)

  // Fetch products belonging to the current supplier
  const { data: supplierProducts, error: productsError } = await supabase
    .from("products")
    .select("id, name, unit_type, price_per_unit, available_quantity")
    .eq("supplier_id", user.id)

  if (productsError) {
    return (
      <div className="p-8 text-destructive">
        Failed to load products: {productsError.message}
      </div>
    )
  }

  const productIds = (supplierProducts || []).map(p => p.id).filter(Boolean)

  // Fetch order_items where product_id belongs to this supplier's products
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("product_id", productIds.length > 0 ? productIds : [""])

  if (itemsError) {
    return (
      <div className="p-8 text-destructive">
        Failed to load order items: {itemsError.message}
      </div>
    )
  }

  // Get unique order IDs from the matched order items
  const orderIds = [...new Set((orderItems || []).map(oi => oi.order_id).filter(Boolean))]

  // Fetch the actual orders for those order IDs
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .in("id", orderIds.length > 0 ? orderIds : [""])
    .order("order_date", { ascending: false })

  console.log("Orders query error:", ordersError)
  console.log("Orders found:", orders?.length)

  if (ordersError) {
    return (
      <div className="p-8 text-destructive">
        Failed to load orders: {ordersError.message}
      </div>
    )
  }

  const ordersData = (orders || []) as Order[]

  // Fetch buyer info for each order
  const buyerIds = [...new Set(ordersData.map(o => o.buyer_id).filter(Boolean))]

  // Buyers are stored in the users table (referenced by buyer_id)
  const { data: buyersFromUsers } = await supabase
    .from("users")
    .select("*")
    .in("id", buyerIds.length > 0 ? buyerIds : [""])

  // Create index maps for quick lookup
  const productsIndex = new Map((supplierProducts || []).map(p => [p.id, p]))
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
        {/* Orders List */}
        <OrdersClient initialOrders={enrichedOrders} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
