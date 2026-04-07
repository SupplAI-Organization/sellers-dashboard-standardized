"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Package, ShoppingCart, TrendingUp, Grid3x3, Search, Settings, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MessagesSheet from "@/components/MessagesSheet"

interface DashboardClientProps {
  displayName: string
  displayEmail: string
  userId: string
  chartData: Array<{ name: string; revenue: number; order: number }>
  orders: Array<{
    id: string
    product_id: string
    quantity: number
    total_price: number
    order_date: string
    payment_method: string
    status: string
    products?: { name: string }
  }>
  products: Array<{
    id: string
    name: string
    price_per_unit: number
    available_quantity: number
  }>
  stats: {
    avgOrderValue: number
    totalOrders: number
    totalRevenue: number
    totalProducts: number
  }
}

export default function DashboardClient({
  displayName,
  displayEmail,
  userId,
  chartData,
  orders,
  products,
  stats,
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const menuItems = [
    { label: "Overview", icon: Grid3x3, active: true, href: "/dashboard" },
    { label: "Products", icon: Package, active: false, href: "/myproducts" },
    { label: "Customer", icon: ShoppingCart, active: false, href: "#" },
    { label: "Orders", icon: ShoppingCart, active: false, href: "#" },
    { label: "Shipment", icon: TrendingUp, active: false, href: "#" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const topProductsByQuantity = [...products]
    .sort((a, b) => b.available_quantity - a.available_quantity)
    .slice(0, 3)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
        style={{backgroundColor: '#1B3C53'}}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold">SupplAI</h2>
        </div>

        <nav className="space-y-1 px-3 py-8">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white"
              style={{
                backgroundColor: item.active ? '#456882' : 'transparent',
                color: item.active ? 'white' : '#cbd5e1'
              }}
              onMouseEnter={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'white'
              }}
              onMouseLeave={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-slate-900 hover:bg-white transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Store Setting</span>
          </button>
          <button
            onClick={async () => {
              const { getSupabaseClient } = await import("@/lib/supabaseClient")
              const supabase = getSupabaseClient()
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Upgrade Pro Card */}
        <div className="absolute left-4 right-4 rounded-lg p-4" style={{backgroundColor: '#456882', borderColor: '#D2C1B6', borderWidth: '1px', bottom: '120px'}}>
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="font-bold text-white mb-1">Upgrade Pro</h3>
          <p className="text-xs text-slate-100 mb-3">Discover new features to detailed report and analysis</p>
          <button className="w-full bg-white text-blue-900 rounded-lg py-2 font-semibold hover:bg-slate-100 transition" style={{color: '#1B3C53'}}>
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{backgroundColor: '#F4EBD3'}}>
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5" style={{color: '#D2C1B6'}} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#ffffff', borderColor: '#D2C1B6', borderWidth: '1px'}}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessagesSheet productId={products.length > 0 ? products[0].id : undefined} userId={userId} />
              <button className="w-10 h-10 rounded-full" style={{backgroundColor: '#D2C1B6'}}></button>
              <div className="text-right">
                <p className="font-semibold" style={{color: '#1B3C53'}}>{displayName}</p>
                <p className="text-sm" style={{color: '#666'}}>{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-1" style={{color: '#1B3C53'}}>Welcome back, {displayName.split(" ")[0]} !</h1>
            <p style={{color: '#666'}}>Here is Your Current Sales Overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="text-white rounded-xl" style={{backgroundColor: '#1B3C53'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium mb-2">AVG. Order Value</p>
                    <p className="text-4xl font-bold mb-1">{formatCurrency(stats.avgOrderValue)}</p>
                    <p className="text-xs text-slate-400">↓ 3.18% <span className="text-slate-500">From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: '#456882'}}>
                    <Package className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl" style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6', borderWidth: '2px'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium mb-2" style={{color: '#666'}}>Total Orders</p>
                    <p className="text-4xl font-bold mb-1" style={{color: '#1B3C53'}}>{stats.totalOrders}</p>
                    <p className="text-xs" style={{color: '#666'}}>-1.18% <span style={{color: '#999'}}>From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: '#F4EBD3'}}>
                    <ShoppingCart className="h-5 w-5" style={{color: '#1B3C53'}} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl" style={{backgroundColor: '#F4EBD3', borderColor: '#D2C1B6', borderWidth: '2px'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium mb-2" style={{color: '#666'}}>Lifetime Value</p>
                    <p className="text-4xl font-bold mb-1" style={{color: '#1B3C53'}}>{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs" style={{color: '#666'}}>+2.24% <span style={{color: '#999'}}>From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: '#F4EBD3'}}>
                    <TrendingUp className="h-5 w-5" style={{color: '#1B3C53'}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Top Products */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2 rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
              <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold" style={{color: '#1B3C53'}}>Sales Overtime</CardTitle>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <span className="w-3 h-3 rounded" style={{backgroundColor: '#1B3C53'}}></span>
                      <span style={{color: '#666'}}>Revenue</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <span className="w-3 h-3 rounded" style={{backgroundColor: '#D2C1B6'}}></span>
                      <span style={{color: '#666'}}>Order</span>
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#1B3C53" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="order" stroke="#D2C1B6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
              <CardHeader className="pb-4" style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold" style={{color: '#1B3C53'}}>Top Selling Product</CardTitle>
                  <Link href="/myproducts" className="text-sm font-semibold hover:underline" style={{color: '#456882'}}>
                    See All Product
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {topProductsByQuantity.length > 0 ? (
                  topProductsByQuantity.map((product) => (
                    <div key={product.id} className="pb-4 last:border-b-0" style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
                      <p className="font-semibold text-sm mb-1 line-clamp-2" style={{color: '#1B3C53'}}>{product.name}</p>
                      <p className="text-xs mb-1" style={{color: '#28a745'}}>{product.available_quantity} stocks remaining</p>
                      <p className="text-xs" style={{color: '#666'}}>{formatCurrency(product.price_per_unit)} per unit</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{color: '#999'}}>No products yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Latest Orders Table */}
          <Card className="rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
            <CardHeader className="pb-6" style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold" style={{color: '#1B3C53'}}>Latest Orders</CardTitle>
                <div className="flex items-center space-x-4">
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: '#666'}}>Customize</button>
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: '#666'}}>Filter</button>
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: '#666'}}>Export</button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Order Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: '#1B3C53'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-opacity-50 hover:bg-slate-100 transition-colors" style={{borderBottomColor: '#D2C1B6', borderBottomWidth: '1px'}}>
                          <td className="py-4 px-4 font-semibold text-sm" style={{color: '#456882'}}>#{order.id.substring(0, 8).toUpperCase()}</td>
                          <td className="py-4 px-4 text-sm" style={{color: '#1B3C53'}}>{order.products?.name || "Product"}</td>
                          <td className="py-4 px-4 text-sm" style={{color: '#1B3C53'}}>{formatDate(order.order_date)}</td>
                          <td className="py-4 px-4 text-sm" style={{color: '#1B3C53'}}>{formatCurrency(order.total_price)}</td>
                          <td className="py-4 px-4 text-sm" style={{color: '#1B3C53'}}>{order.payment_method}</td>
                          <td className="py-4 px-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button style={{color: '#D2C1B6'}} className="hover:text-slate-600">⋯</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 px-4 text-center" style={{color: '#999'}}>
                          No orders yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-8 right-8 md:hidden z-40 text-white p-3 rounded-full"
        style={{backgroundColor: '#1B3C53'}}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  )
}
