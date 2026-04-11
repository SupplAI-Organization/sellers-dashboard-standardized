"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

type Message = {
  id: number
  content: string | null
  sender_id: string | null
  sender_role: string | null
  receiver_id: string | null
  created_at: string
}

type Buyer = {
  id: string
  business_name: string | null
}

export default function MessagesSheet({
  productId,
  userId,
}: {
  productId?: string | null
  userId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [activeBuyerId, setActiveBuyerId] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── Fetch all messages + subscribe when sheet opens ──────────────────────────
  useEffect(() => {
    if (!open) return

    // 1. Initial fetch
    let query = supabase.from("messages").select("*")
    
    if (productId) {
      query = query.eq("product_id", productId)
    }
    
    query
      .order("created_at", { ascending: true })
      .then(({ data, error: err }: { data: Message[] | null; error: { message: string } | null }) => {
        setError(err?.message ?? null)
        setLoading(false)
        if (!err) setAllMessages(data ?? [])
      })

    // 2. Real-time — append inserts as they arrive
    const channelName = productId ? `messages-product-${productId}` : `messages-all`
    const filterClause = productId ? `product_id=eq.${productId}` : undefined
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", ...(filterClause && { filter: filterClause }) },
        (payload: { new: Message }) => {
          setAllMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [open, productId])

  // ── Derive buyers from messages, fetch business_names ─────────────────────────────────
  useEffect(() => {
    const buyerIds = Array.from(
      new Set(
        allMessages
          .filter((m) => m.sender_role === "buyer" && m.sender_id)
          .map((m) => m.sender_id as string)
      )
    )

    ;(async () => {
      if (buyerIds.length === 0) {
        setBuyers([])
        setActiveBuyerId(null)
        return
      }

      const params = new URLSearchParams({ ids: buyerIds.join(",") })
      const res = await fetch(`/api/buyers?${params}`)
      if (!res.ok) {
        setError("Failed to load buyer business_names")
        return
      }
      const data: Buyer[] = await res.json()
      const buyerList: Buyer[] = buyerIds.map((id) => {
        const u = data.find((r) => r.id === id)
        return u ?? { id, business_name: null }
      })
      setBuyers(buyerList)
      setActiveBuyerId((prev) => {
        if (prev && buyerList.some((b) => b.id === prev)) return prev
        return buyerList[0]?.id ?? null
      })
    })()
  }, [allMessages])

  // ── Scroll to latest on new messages or tab switch ───────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages, activeBuyerId])

  // ── Send ─────────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const trimmed = text.trim()
    if (!trimmed || sending || !activeBuyerId) return
    if (!productId) {
      setError("No product selected for messaging")
      return
    }
    setSending(true)
    setText("")
    const { error: err } = await supabase.from("messages").insert({
      product_id: productId,
      sender_id: userId,
      sender_role: "seller",
      receiver_id: activeBuyerId,
      content: trimmed,
    })
    if (err) setError(err.message)
    setSending(false)
  }

  // ── Thread for active buyer ───────────────────────────────────────────────────
  // buyer's own messages + AI replies + seller replies (all target this buyer)
  const thread = activeBuyerId
    ? allMessages.filter(
        (m) => m.sender_id === activeBuyerId || m.receiver_id === activeBuyerId
      )
    : []

  const activeBuyer = buyers.find((b) => b.id === activeBuyerId)

  function bubbleStyle(msg: Message) {
    if (msg.sender_id === userId)
      return { align: "items-end", bubble: "bg-primary text-primary-foreground rounded-br-sm", label: "You" }
    if (msg.sender_role === "buyer")
      return { align: "items-start", bubble: "bg-background border text-foreground rounded-bl-sm shadow-sm", label: activeBuyer?.business_name || "Buyer" }
    // AI or other
    return { align: "items-start", bubble: "bg-muted border text-foreground rounded-bl-sm", label: "AI Assistant" }
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Trigger */}
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
        </svg>
        Messages
        {buyers.length > 0 && (
          <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 leading-none">
            {buyers.length}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-md gap-0">

          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle>Messages</SheetTitle>
          </SheetHeader>

          {error && <p className="text-xs text-destructive px-4 py-2 bg-destructive/5 border-b">{error}</p>}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* No buyers */}
          {!loading && buyers.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <svg className="size-10 text-muted-foreground/30" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-muted-foreground">No enquiries yet</p>
            </div>
          )}

          {/* Buyer tabs + thread */}
          {!loading && buyers.length > 0 && (
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Tab strip */}
              <div className="flex overflow-x-auto border-b shrink-0 bg-background">
                {buyers.map((buyer) => (
                  <button
                    key={buyer.id}
                    onClick={() => setActiveBuyerId(buyer.id)}
                    className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      buyer.id === activeBuyerId
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {buyer.business_name || `Buyer ${buyer.id.slice(0, 6)}`}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/10">
                {thread.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">
                    No messages in this conversation
                  </p>
                ) : (
                  thread.map((msg) => {
                    const { align, bubble, label } = bubbleStyle(msg)
                    return (
                      <div key={msg.id} className={`flex flex-col gap-0.5 ${align}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${bubble}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1">
                          {label} · {formatTime(msg.created_at)}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-end gap-2 px-4 py-4 border-t bg-background shrink-0">
                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
                  }}
                  placeholder={`Reply to ${activeBuyer?.business_name || "buyer"}…`}
                  className="flex-1 resize-none rounded-xl border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 max-h-32"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending || !activeBuyerId}
                  className="shrink-0 rounded-xl bg-primary p-2.5 text-primary-foreground transition-opacity disabled:opacity-40 hover:opacity-90"
                  aria-label="Send"
                >
                  {sending ? (
                    <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                    </svg>
                  )}
                </button>
              </div>

            </div>
          )}

        </SheetContent>
      </Sheet>
    </>
  )
}
