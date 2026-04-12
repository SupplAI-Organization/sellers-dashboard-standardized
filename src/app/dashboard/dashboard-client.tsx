"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, Search, ShoppingCart, TrendingUp } from "lucide-react"


interface DashboardClientProps {
  displayName: string
  displayEmail: string
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
  topSellingProducts: Array<{
    quantity: number
    revenue: number
    productData?: {
      id: string
      name: string
      price_per_unit: number
      available_quantity: number
    }
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
  chartData,
  orders,
  topSellingProducts,
  stats,
}: DashboardClientProps) {
  // Use props directly instead of state to avoid unnecessary renders
  const userName = displayName
  const userEmail = displayEmail

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

  return (
    <div className="flex-1 overflow-auto w-full" style={{backgroundColor: 'var(--dashboard-bg)'}}>
      <div className="p-4 md:p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5" style={{color: 'var(--dashboard-border)'}} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{backgroundColor: '#ffffff', borderColor: 'var(--dashboard-border)', borderWidth: '1px'}}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 rounded-full" style={{backgroundColor: 'var(--dashboard-border)'}}></button>
              <div className="text-right">
                <p className="font-semibold" style={{color: 'var(--dashboard-primary)'}}>{userName}</p>
                <p className="text-sm" style={{color: 'var(--dashboard-text-muted)'}}>{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-1" style={{color: 'var(--dashboard-primary)'}}>Welcome back, {userName.split(" ")[0]} !</h1>
            <p style={{color: 'var(--dashboard-text-muted)'}}>Here is Your Current Sales Overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="text-white rounded-xl" style={{backgroundColor: 'var(--dashboard-primary)'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium mb-2">AVG. Order Value</p>
                    <p className="text-4xl font-bold mb-1">{formatCurrency(stats.avgOrderValue)}</p>
                    <p className="text-xs text-slate-400">↓ 3.18% <span className="text-slate-500">From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--dashboard-secondary)'}}>
                    <Package className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-white rounded-xl" style={{backgroundColor: 'var(--dashboard-primary)'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium mb-2">Total Orders</p>
                    <p className="text-4xl font-bold mb-1">{stats.totalOrders}</p>
                    <p className="text-xs text-slate-400">-1.18% <span className="text-slate-500">From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--dashboard-secondary)'}}>
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-white rounded-xl" style={{backgroundColor: 'var(--dashboard-primary)'}}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium mb-2">Lifetime Value</p>
                    <p className="text-4xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-slate-400">+2.24% <span className="text-slate-500">From last month</span></p>
                  </div>
                  <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--dashboard-secondary)'}}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Top Products */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2 rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
              <CardHeader className="pb-4" style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold" style={{color: 'var(--dashboard-primary)'}}>Sales Overtime</CardTitle>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <span className="w-3 h-3 rounded" style={{backgroundColor: 'var(--dashboard-primary)'}}></span>
                      <span style={{color: 'var(--dashboard-text-muted)'}}>Revenue</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <span className="w-3 h-3 rounded" style={{backgroundColor: 'var(--dashboard-border)'}}></span>
                      <span style={{color: 'var(--dashboard-text-muted)'}}>Order</span>
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
                    <Line type="monotone" dataKey="revenue" stroke="var(--dashboard-primary)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="order" stroke="var(--dashboard-border)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
              <CardHeader className="pb-4" style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold" style={{color: 'var(--dashboard-primary)'}}>Top Selling Product</CardTitle>
                  <Link href="/myproducts" className="text-sm font-semibold hover:underline" style={{color: 'var(--dashboard-secondary)'}}>
                    See All Product
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {topSellingProducts.length > 0 ? (
                  topSellingProducts.map((product, idx) => (
                    <div key={idx} className="pb-4 last:border-b-0" style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
                      <p className="font-semibold text-sm mb-1 line-clamp-2" style={{color: 'var(--dashboard-primary)'}}>{product.productData?.name}</p>
                      <p className="text-xs mb-1" style={{color: 'var(--dashboard-success)'}}>{product.quantity} units sold</p>
                      <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>{formatCurrency(product.revenue)} revenue</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{color: 'var(--dashboard-text-light)'}}>No sales yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Latest Orders Table */}
          <Card className="rounded-xl shadow-sm" style={{backgroundColor: '#ffffff'}}>
            <CardHeader className="pb-6" style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold" style={{color: 'var(--dashboard-primary)'}}>Latest Orders</CardTitle>
                <div className="flex items-center space-x-4">
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: 'var(--dashboard-text-muted)'}}>Customize</button>
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: 'var(--dashboard-text-muted)'}}>Filter</button>
                  <button className="text-sm font-semibold hover:text-slate-900" style={{color: 'var(--dashboard-text-muted)'}}>Export</button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Order Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-primary)'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-opacity-50 hover:bg-slate-100 transition-colors" style={{borderBottomColor: 'var(--dashboard-border)', borderBottomWidth: '1px'}}>
                          <td className="py-4 px-4 font-semibold text-sm" style={{color: 'var(--dashboard-secondary)'}}>#{order.id.substring(0, 8).toUpperCase()}</td>
                          <td className="py-4 px-4 text-sm" style={{color: 'var(--dashboard-primary)'}}>{order.products?.name || "Product"}</td>
                          <td className="py-4 px-4 text-sm" style={{color: 'var(--dashboard-primary)'}}>{formatDate(order.order_date)}</td>
                          <td className="py-4 px-4 text-sm" style={{color: 'var(--dashboard-primary)'}}>{formatCurrency(order.total_price)}</td>
                          <td className="py-4 px-4 text-sm" style={{color: 'var(--dashboard-primary)'}}>{order.payment_method}</td>
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
                            <button style={{color: 'var(--dashboard-border)'}} className="hover:text-slate-600">⋯</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 px-4 text-center" style={{color: 'var(--dashboard-text-light)'}}>
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

  )
}
