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

  // Fetch supplier profile
  const { data: supplierProfile } = await supabase
    .from("supplier_profiles")
    .select("*")
    .eq("supplier_id", user.id)
    .single()

  // Fetch recent orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*, products(name)")
    .eq("supplier_id", user.id)
    .order("order_date", { ascending: false })
    .limit(5)

  const orders = ordersData || []

  // Fetch supplier products
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("supplier_id", user.id)
    .order("listed_at", { ascending: false })
    .limit(5)

  const products = productsData || []

  // Fetch profile for display name
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

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

  const displayName = userProfile?.full_name || supplierProfile?.contact_person || "Seller"
  const displayEmail = userProfile?.email || user.email || ""

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AppSidebar />
      <DashboardClient 
        displayName={displayName}
        displayEmail={displayEmail}
        chartData={chartData}
        orders={orders || []}
        products={products || []}
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