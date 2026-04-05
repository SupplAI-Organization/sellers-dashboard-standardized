import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")
  if (!ids) return NextResponse.json([])

  const idList = ids.split(",").filter(Boolean)
  if (idList.length === 0) return NextResponse.json([])

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, business_name")
    .in("id", idList)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
