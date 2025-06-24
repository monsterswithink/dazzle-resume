import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { ResumeDataSchema } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ResumeDataSchema.partial().parse(body)

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("resumes")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 })
  }
}
