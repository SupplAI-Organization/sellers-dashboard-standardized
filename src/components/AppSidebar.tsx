"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, ShoppingCart, Settings, Users, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    href: "/myproducts",
    description: "Manage your product listings",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
    description: "View and manage orders",
  },
  {
    title: "Buyers",
    icon: Users,
    href: "/buyers",
    description: "Manage buyer relationships",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    description: "Account and business settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Seller Hub</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "transition-colors",
                    isActive && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
