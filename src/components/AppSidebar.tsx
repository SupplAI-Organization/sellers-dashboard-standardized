"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Package, ShoppingCart, TrendingUp, Grid3x3, Settings, LogOut, Menu, X } from "lucide-react"

const menuItems = [
  { label: "Overview", icon: Grid3x3, href: "/dashboard" },
  { label: "Products", icon: Package, href: "/myproducts" },
  { label: "Orders", icon: ShoppingCart, href: "/orders" },
  { label: "Shipment", icon: TrendingUp, href: "#" },
]

export function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 text-white transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
        style={{backgroundColor: '#1B3C53'}}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold">SupplAI</h2>
        </div>

        <nav className="space-y-1 px-3 py-8">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white"
                style={{
                  backgroundColor: active ? '#456882' : 'transparent',
                  color: active ? 'white' : '#cbd5e1'
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = '#333c4d'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
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
          </div>
          <h3 className="font-bold text-white mb-1">Upgrade Pro</h3>
          <p className="text-xs text-slate-100 mb-3">Discover new features to detailed report and analysis</p>
          <button className="w-full bg-white text-blue-900 rounded-lg py-2 font-semibold hover:bg-slate-100 transition" style={{color: '#1B3C53'}}>
            Upgrade Now
          </button>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-4 lg:hidden text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-40 text-white p-3 rounded-full"
        style={{backgroundColor: '#1B3C53'}}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  )
}
