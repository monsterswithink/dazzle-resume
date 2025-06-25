import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ENRICHLAYER_URL = "https://enrichlayer.com/api/v2/profile";
const ENRICH_PARAMS =
  "extra=include&github_profile_id=include&facebook_profile_id=include&twitter_profile_id=include&personal_contact_number=include&personal_email=include&inferred_salary=include&skills=include&use_cache=if-present&fallback_to_cache=on-error";

export async function POST(request: NextRequest) {
  // 1. Auth header
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  // 2. Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Find or create resume row for this user (upsert)
  let { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    // Insert if missing
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({ user_id: user.id })
      .select("*")
      .single();
    if (insertError || !newResume) {
      return NextResponse.json({ error: "Could not create resume row" }, { status: 500 });
    }
    resume = newResume;
  }

  // 5. Get LinkedIn access token from Supabase identity
  const identity = user.identities?.find(
    (id) => id.provider === "linkedin" || id.provider === "linkedin_oidc"
  );
  if (!identity?.identity_data?.access_token) {
    return NextResponse.json({ error: "No LinkedIn access token found" }, { status: 400 });
  }
  const linkedinToken = identity.identity_data.access_token;

  // 6. Get vanityName from LinkedIn API if URL missing
  let linkedinProfileUrl = resume.linkedin_profile_url;
  if (!linkedinProfileUrl) {
    const profileRes = await fetch(
      "https://api.linkedin.com/v2/me?projection=(id,vanityName)",
      {
        headers: { Authorization: `Bearer ${linkedinToken}` },
      }
    );
    if (!profileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from LinkedIn" }, { status: 502 });
    }
    const profile = await profileRes.json();
    if (profile.vanityName) {
      linkedinProfileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
      // update resume row with profile URL
      await supabase
        .from("resumes")
        .update({ linkedin_profile_url: linkedinProfileUrl })
        .eq("user_id", user.id);
    } else {
      return NextResponse.json({ error: "Could not get LinkedIn vanityName" }, { status: 400 });
    }
  }

  // 7. Call EnrichLayer with LinkedIn profile URL
  let enrichData: any = {};
  try {
    const enrichResp = await fetch(
      `${ENRICHLAYER_URL}?linkedin_profile_url=${encodeURIComponent(linkedinProfileUrl)}&${ENRICH_PARAMS}`,
      {
        headers: { Authorization: `Bearer ${process.env.ENRICH_API_KEY}` },
      }
    );
    if (enrichResp.ok) {
      enrichData = await enrichResp.json();
    } else {
      return NextResponse.json({ error: "EnrichLayer API error" }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json({ error: "EnrichLayer fetch failed", details: `${e}` }, { status: 502 });
  }

  // 8. Update resumes table with enrich data
  const { error: updateError } = await supabase
    .from("resumes")
    .update({ linkedin_data: enrichData })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update linkedin_data", details: updateError.message }, { status: 500 });
  }

  // 9. Return updated resume
  const { data: updatedResume, error: finalError } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (finalError || !updatedResume) {
    return NextResponse.json({ error: "Failed to fetch updated resume" }, { status: 500 });
  }

  return NextResponse.json(updatedResume);
}
