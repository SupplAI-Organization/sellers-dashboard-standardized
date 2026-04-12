import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"
import { AppSidebar } from "@/components/AppSidebar"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch recent orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .eq("supplier_id", user.id)
    .order("order_date", { ascending: false })

  const orders = ordersData || []

  // Fetch order items for all orders to calculate top-selling products
  const orderIds = orders.map(o => o.id).filter(Boolean)
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds.length > 0 ? orderIds : [""])

  // Fetch supplier products
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("supplier_id", user.id)
    .order("listed_at", { ascending: false })

  const products = productsData || []

  // Fetch profile for display name - try from users table first
  const { data: userDetails } = await supabase
    .from("users")
    .select("contact_person, business_name")
    .eq("id", user.id)

  // Fallback to supplier profile if users table data not available
  const { data: supplierProfiles } = await supabase
    .from("supplier_profiles")
    .select("*")
    .eq("supplier_id", user.id)

  const supplierProfile = supplierProfiles?.[0] || null
  const userDetail = userDetails?.[0] || null

  // Calculate stats
  const totalOrders = orders?.length || 0
  const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total_price || 0), 0)
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0"
  const totalProducts = products?.length || 0

  // Generate chart data from real orders (last 7 days grouped by date)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const chartData = last7Days.map((date) => {
    const dayOrders = (orders || []).filter((o) =>
      o.order_date?.split("T")[0] === date
    )
    return {
      name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0),
      order: dayOrders.length,
    }
  })

  const displayName = userDetail?.contact_person || supplierProfile?.contact_person || "Seller"
  const displayEmail = user.email || ""

  // Calculate top-selling products from order items
  const productSales = new Map<string, { quantity: number; revenue: number; productData?: typeof products[0] }>()
  
  ;(orderItems || []).forEach(item => {
    const current = productSales.get(item.product_id) || { quantity: 0, revenue: 0 }
    productSales.set(item.product_id, {
      quantity: current.quantity + (item.quantity || 0),
      revenue: current.revenue + (item.price_at_purchase * (item.quantity || 0)),
      productData: products.find(p => p.id === item.product_id),
    })
  })

  const topSellingProducts = Array.from(productSales.values())
    .filter(p => p.productData)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <DashboardClient 
        displayName={displayName}
        displayEmail={displayEmail}
        chartData={chartData}
        orders={orders || []}
        products={products || []}
        topSellingProducts={topSellingProducts}
        stats={{
          avgOrderValue: parseFloat(avgOrderValue),
          totalOrders,
          totalRevenue,
          totalProducts,
        }}
      />
    </div>
  )
}