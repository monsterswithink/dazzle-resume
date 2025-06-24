import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get LinkedIn profile URL from identity data, or fetch if necessary
    const identity = user.identities?.find(
      (id) => id.provider === "linkedin" || id.provider === "linkedin_oidc"
    );
    console.log("LINKEDIN identity_data:", identity?.identity_data);

    let linkedinProfileUrl: string | undefined = undefined;

    // 1. Try publicIdentifier or vanityName from identity_data
    if (identity?.identity_data?.publicIdentifier) {
      linkedinProfileUrl = `https://www.linkedin.com/in/${identity.identity_data.publicIdentifier}`;
    } else if (identity?.identity_data?.vanityName) {
      linkedinProfileUrl = `https://www.linkedin.com/in/${identity.identity_data.vanityName}`;
    } else if (identity?.identity_data?.url) {
      linkedinProfileUrl = identity.identity_data.url;
    }

    // 2. If not found, try fetching from LinkedIn directly using access_token
    if (!linkedinProfileUrl && identity?.identity_data?.access_token) {
      try {
        const fetchProfile = await fetch(
          "https://api.linkedin.com/v2/me?projection=(id,vanityName,localizedFirstName,localizedLastName)",
          {
            headers: {
              Authorization: `Bearer ${identity.identity_data.access_token}`,
            },
          }
        );
        const profile = await fetchProfile.json();
        if (profile.vanityName) {
          linkedinProfileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
        }
      } catch (err) {
        console.error("LinkedIn API fetch for vanityName failed", err);
      }
    }

    if (!linkedinProfileUrl) {
      return NextResponse.json(
        { error: "LinkedIn public profile URL not found in identity metadata" },
        { status: 400 }
      );
    }

    // Build EnrichLayer request
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
    });

    const enriched = await fetch(
      `https://enrichlayer.com/api/v2/profile?${enrichParams}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ENRICH_API_KEY}`,
        },
      }
    );

    if (!enriched.ok) {
      const msg = await enriched.text();
      return NextResponse.json(
        {
          error: "EnrichLayer error",
          details: msg,
          linkedin_url: linkedinProfileUrl, // for debug
        },
        { status: 500 }
      );
    }

    const enrichedData = await enriched.json();

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
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      message: "LinkedIn data synced from EnrichLayer successfully.",
    });
  } catch (error) {
    console.error("LinkedIn sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
