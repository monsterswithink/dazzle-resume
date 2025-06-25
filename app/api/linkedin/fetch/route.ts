import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ENRICHLAYER_URL = "https://enrichlayer.com/api/v2/profile";
const ENRICH_PARAMS =
  "extra=include&github_profile_id=include&facebook_profile_id=include&twitter_profile_id=include&personal_contact_number=include&personal_email=include&inferred_salary=include&skills=include&use_cache=if-present&fallback_to_cache=on-error";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Wait for Supabase auth to propagate, retry up to 3 times for eventual consistency
  let user = null, userError = null, attempts = 0;
  while (attempts < 3) {
    const res = await supabase.auth.getUser(token);
    user = res.data.user;
    userError = res.error;
    if (user) break;
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resume row may not exist yet; wait for it up to 3 times
  let resume = null, resumeError = null;
  attempts = 0;
  while (attempts < 3) {
    const res = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .single();
    resume = res.data;
    resumeError = res.error;
    if (resume) break;
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }
  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Get LinkedIn access token from Supabase identity
  const identity = user.identities?.find(
    (id) => id.provider === "linkedin" || id.provider === "linkedin_oidc"
  );
  if (!identity?.identity_data?.access_token)
    return NextResponse.json({ error: "No LinkedIn access token found" }, { status: 400 });

  // Fetch LinkedIn profile URL (vanityName)
  let linkedinProfileUrl = resume.linkedin_profile_url;
  if (!linkedinProfileUrl) {
    const profileRes = await fetch(
      "https://api.linkedin.com/v2/me?projection=(vanityName)",
      { headers: { Authorization: `Bearer ${identity.identity_data.access_token}` } }
    );
    if (!profileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch LinkedIn profile." }, { status: 502 });
    }
    const profile = await profileRes.json();
    if (profile.vanityName) {
      linkedinProfileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
      // Upsert the URL into resumes
      await supabase
        .from("resumes")
        .update({ linkedin_profile_url: linkedinProfileUrl })
        .eq("user_id", user.id);
    } else {
      return NextResponse.json({ error: "Could not get LinkedIn vanityName" }, { status: 400 });
    }
  }

  // Call EnrichLayer with LinkedIn profile URL
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
    return NextResponse.json({ error: "EnrichLayer fetch failed", details: e }, { status: 502 });
  }

  // Update the resume row with new LinkedIn URL and data
  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      linkedin_profile_url: linkedinProfileUrl,
      linkedin_data: enrichData
    })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update resume", details: updateError.message }, { status: 500 });
  }

  // Return updated resume
  const { data: updatedResume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(updatedResume);
}
