// ./app/api/linkedin/fetch/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pull LinkedIn profile URL from identities metadata
    const identity = user.identities?.find((id) => id.provider === "linkedin")
    const linkedinProfileUrl = identity?.identity_data?.url

    if (!linkedinProfileUrl) {
      return NextResponse.json({ error: "LinkedIn URL not found in identity metadata" }, { status: 400 })
    }

    // EnrichLayer call with LinkedIn URL
    const enrichRes = await fetch("https://enrichlayer.com/api/v2/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ENRICH_API_KEY}`,
      },
      next: { revalidate: 10 }, // optional caching if ISR supported
    })

    const enrichParams = new URLSearchParams({
      linkedin_profile_url: linkedinProfileUrl,
      extra: "include",
      github_profile_id: "include",
      facebook_profile_id: "include",
      twitter_profile_id: "include",
      personal_contact_number: "include",
      personal_email: "include",
      inferred_salary: "include",
      skills: "include",
      use_cache: "if-present",
      fallback_to_cache: "on-error",
    })

    const enriched = await fetch(`https://enrichlayer.com/api/v2/profile?${enrichParams}`, {
      headers: {
        Authorization: `Bearer ${process.env.ENRICH_API_KEY}`,
      },
    })

    if (!enriched.ok) {
      const msg = await enriched.text()
      return NextResponse.json({ error: "EnrichLayer error", details: msg }, { status: 500 })
    }

    const enrichedData = await enriched.json()

    // Upsert resume record
    const { data, error } = await supabase
      .from("resumes")
      .upsert({
        user_id: user.id,
        linkedin_data: enrichedData,
        linkedin_connected: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, message: "LinkedIn data synced from EnrichLayer." })
  } catch (error) {
    console.error("LinkedIn sync error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
