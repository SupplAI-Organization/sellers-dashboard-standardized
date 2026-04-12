"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart } from "lucide-react"

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
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function OrdersClient({
  initialOrders,
  userId,
}: {
  initialOrders: Order[]
  userId: string
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    let subscribed = true

    // Set up real-time subscription to orders changes
    const subscribeToOrders = async () => {
      try {
        const { getSupabaseClient } = await import("@/lib/supabaseClient")
        const supabase = getSupabaseClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel = (supabase as any)
          .channel(`orders-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `supplier_id=eq.${userId}`,
            },
            (payload: { eventType: string; new?: Order; old?: Record<string, unknown> }) => {
              if (!subscribed) return

              if (payload.eventType === "INSERT" && payload.new) {
                setOrders((prev) => [payload.new as Order, ...prev])
              } else if (payload.eventType === "UPDATE" && payload.new) {
                setOrders((prev) =>
                  prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
                )
              } else if (payload.eventType === "DELETE" && payload.old) {
                setOrders((prev) => prev.filter((o) => o.id !== (payload.old as Record<string, unknown>).id))
              }
            }
          )
          .subscribe()

        return () => {
          channel?.unsubscribe()
        }
      } catch (error) {
        console.error("Failed to subscribe to orders:", error)
      }
    }

    subscribeToOrders()

    return () => {
      subscribed = false
    }
  }, [userId])

  return (
    <div style={{ backgroundColor: "#ffffff", borderColor: "#E5E5E5" }} className="rounded-lg border shadow-sm">
      {/* Table Header */}
      <div style={{ backgroundColor: "#F9F9F9", borderBottomColor: "#E5E5E5" }} className="px-6 py-4 border-b">
        <h3 className="font-semibold text-lg" style={{ color: "#1B3C53" }}>
          Order Details
        </h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <ShoppingCart className="h-12 w-12 mb-3" style={{ color: "#DDD" }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1B3C53" }}>
              No orders yet
            </h3>
            <p style={{ color: "#999" }} className="mb-4">
              Orders from buyers will appear here
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F9F9F9", borderBottomColor: "#E5E5E5" }} className="border-b">
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  ORDER ID
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  PRODUCT
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  QUANTITY
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  UNIT
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  PRICE/UNIT
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  BUYER NAME
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  BUYER EMAIL
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  BUYER PHONE
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  ADDRESS
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  TOTAL AMOUNT
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  PAYMENT METHOD
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  STATUS
                </th>
                <th className="text-left py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  DATE
                </th>
                <th className="text-center py-3 px-6 font-semibold text-xs" style={{ color: "#999" }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottomColor: "#E5E5E5" }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded" style={{ color: "#1B3C53" }}>
                      {order.id.substring(0, 8)}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold" style={{ color: "#1B3C53" }}>
                      {order.items && order.items.length > 0
                        ? order.items.map((item) => item.product_name).join(", ")
                        : "Product"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold" style={{ color: "#1B3C53" }}>
                      {order.items && order.items.length > 0
                        ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                        : 0}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm" style={{ color: "#1B3C53" }}>
                      {order.items && order.items.length > 0
                        ? order.items.map((item) => item.product_unit_type || "unit").join(", ")
                        : "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold" style={{ color: "#1B3C53" }}>
                      {order.items && order.items.length > 0
                        ? "₹" +
                          order.items
                            .map((item) => Number(item.product_price_per_unit || item.price_at_purchase))
                            .join(", ")
                        : "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium" style={{ color: "#1B3C53" }}>
                      {order.buyers?.contact_person || "Unknown"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs" style={{ color: "#1B3C53" }}>
                      {order.buyers?.email || "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs" style={{ color: "#1B3C53" }}>
                      {order.buyers?.contact_number || "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs" style={{ color: "#1B3C53" }}>
                      {order.buyers?.business_address ? order.buyers.business_address.substring(0, 30) : "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold" style={{ color: "#1B3C53" }}>
                      ₹{Number(order.calculatedTotalPrice || order.total_price).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm" style={{ color: "#1B3C53" }}>
                      {order.payment_method ? statusLabel(order.payment_method) : "-"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      className="font-semibold text-xs"
                      style={{
                        backgroundColor:
                          order.status === "completed" || order.status === "delivered"
                            ? "#D1FAE5"
                            : order.status === "pending"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                        color:
                          order.status === "completed" || order.status === "delivered"
                            ? "#059669"
                            : order.status === "pending"
                              ? "#D97706"
                              : "#DC2626",
                        border: "none",
                      }}
                    >
                      {statusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm" style={{ color: "#1B3C53" }}>
                      {new Date(order.order_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                        <Eye className="h-4 w-4" style={{ color: "#1B3C53" }} />
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
      {orders.length > 0 && (
        <div
          style={{ backgroundColor: "#F9F9F9", borderTopColor: "#E5E5E5" }}
          className="px-6 py-3 border-t flex items-center justify-between text-sm"
        >
          <span style={{ color: "#999" }}>Showing {orders.length} orders</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
