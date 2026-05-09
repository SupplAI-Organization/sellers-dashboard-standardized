"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Grid3x3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Percent,
} from "lucide-react";

const menuItems = [
  { label: "Overview", icon: Grid3x3, href: "/dashboard" },
  { label: "Products", icon: Package, href: "/myproducts" },
  { label: "Orders", icon: ShoppingCart, href: "/orders" },
  { label: "Discounts", icon: Percent, href: "/discounts" },
  { label: "Shipment", icon: TrendingUp, href: "#" },
];

export function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Spacer to hold the 20-width (80px) baseline */}
      <div
        className="hidden lg:block w-20 shrink-0 bg-white"
        style={{
          borderRightWidth: "1px",
          borderRightColor: "var(--dashboard-border)",
        }}
      ></div>

      {/* Sidebar */}
      <div
        className={`absolute lg:fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 overflow-hidden flex flex-col group shadow-lg lg:shadow-[4px_0_24px_rgba(0,0,0,0.05)] ${
          sidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full w-64 lg:translate-x-0 lg:w-20 hover:w-64"
        }`}
        style={{
          borderRightWidth: "1px",
          borderRightColor: "var(--dashboard-border)",
          top: "64px", // height of the topbar
          height: "calc(100vh - 64px)",
        }}
      >
        {/* Nav Items */}
        <nav className="flex-1 space-y-2 px-3 py-4 mt-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center space-x-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? "bg-slate-200 text-slate-900 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className="h-6 w-6 shrink-0"
                  style={{
                    color: active ? "var(--dashboard-primary)" : "currentColor",
                  }}
                />
                <span
                  className={`font-medium transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Pro Card - Hidden when collapsed */}
        <div
          className={`mx-4 mb-4 rounded-xl p-4 bg-neutral-100/80 backdrop-blur-md border border-neutral-200 shadow-sm transition-opacity duration-300 flex flex-col whitespace-nowrap overflow-hidden ${sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}`}
        >
          <div className="bg-white rounded-full w-10 h-10 shadow-sm flex items-center justify-center mb-3 shrink-0">
            <Sparkles className="text-amber-500 h-5 w-5" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-1">Upgrade Pro</h3>
          <p className="text-xs text-neutral-600 mb-3 whitespace-normal leading-tight">
            Discover new features to detailed report and analysis
          </p>
          <button className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-neutral-800 transition shadow-sm">
            Upgrade Now
          </button>
        </div>

        {/* Bottom Menu */}
        <div className="p-3 space-y-1 mb-2 border-t border-slate-100">
          <button className="w-full flex items-center space-x-4 px-3 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap overflow-hidden">
            <Settings className="h-6 w-6 shrink-0" />
            <span
              className={`font-medium transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}`}
            >
              Store Setting
            </span>
          </button>
          <button
            onClick={async () => {
              const { getSupabaseClient } =
                await import("@/lib/supabaseClient");
              const supabase = getSupabaseClient();
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="w-full flex items-center space-x-4 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap overflow-hidden"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span
              className={`font-medium transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"}`}
            >
              Logout
            </span>
          </button>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-slate-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Button - positioned inside topbar area visually or fixed below */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 text-slate-700 bg-white p-3 rounded-full shadow-lg border border-slate-100"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  );
}
