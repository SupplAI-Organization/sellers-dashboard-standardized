"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

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

export default function OrdersClient({
  initialOrders,
  userId,
}: {
  initialOrders: Order[]
  userId: string
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    // Set up real-time subscription to orders changes
    const subscribeToOrders = async () => {
      const { getSupabaseClient } = await import("@/lib/supabaseClient")
      const supabase = getSupabaseClient()

      const subscription = supabase
        .channel(`orders-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `supplier_id=eq.${userId}`,
          },
          (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new as unknown as Order, ...prev])
            } else if (payload.eventType === "UPDATE") {
              setOrders((prev) =>
                prev.map((o) => (o.id === (payload.new as unknown as Order).id ? (payload.new as unknown as Order) : o))
              )
            } else if (payload.eventType === "DELETE") {
              setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return subscription
    }

    subscribeToOrders()
  }, [userId])

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-semibold">{order.products?.name || "Unknown Product"}</p>
            <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
          </div>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      ))}
    </div>
  )
}
