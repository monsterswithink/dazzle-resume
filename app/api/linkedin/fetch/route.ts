import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ENRICHLAYER_URL = "https://enrichlayer.com/api/v2/profile";
const ENRICH_PARAMS =
  "extra=include&github_profile_id=include&facebook_profile_id=include&twitter_profile_id=include&personal_contact_number=include&personal_email=include&inferred_salary=include&skills=include&use_cache=if-present&fallback_to_cache=on-error";

const EMPTY_JSON = {
  accomplishment_courses: [],
  accomplishment_honors_awards: [],
  accomplishment_organisations: [],
  accomplishment_patents: [],
  accomplishment_projects: [
    {
      description: "",
      ends_at: { day: "", month: "", year: "" },
      starts_at: { day: "", month: "", year: "" },
      title: "",
      url: "",
    },
  ],
  accomplishment_publications: [],
  accomplishment_test_scores: [],
  activities: [
    {
      activity_status: "",
      link: "",
      title: "",
    },
  ],
  articles: [],
  background_cover_image_url: "",
  certifications: [
    {
      authority: "",
      display_source: "",
      ends_at: { day: "", month: "", year: "" },
      license_number: "",
      name: "",
      starts_at: { day: "", month: "", year: "" },
      url: "",
    },
  ],
  city: "",
  connections: "",
  country: "",
  country_full_name: "",
  education: [
    {
      activities_and_societies: "",
      degree_name: "",
      description: "",
      ends_at: { day: "", month: "", year: "" },
      field_of_study: "",
      grade: "",
      logo_url: "",
      school: "",
      school_facebook_profile_url: "",
      school_linkedin_profile_url: "",
      starts_at: { day: "", month: "", year: "" },
    },
  ],
  experiences: [
    {
      company: "",
      company_facebook_profile_url: "",
      company_linkedin_profile_url: "",
      description: "",
      ends_at: { day: "", month: "", year: "" },
      location: "",
      logo_url: "",
      starts_at: { day: "", month: "", year: "" },
      title: "",
    },
  ],
  first_name: "",
  follower_count: "",
  full_name: "",
  groups: [],
  headline: "",
  last_name: "",
  occupation: "",
  people_also_viewed: [],
  profile_pic_url: "",
  public_identifier: "",
  recommendations: [""],
  similarly_named_profiles: [
    {
      link: "",
      location: "",
      name: "",
      summary: "",
    },
  ],
  state: "",
  summary: "",
  volunteer_work: [],
};

export async function POST(request: NextRequest) {
  // 1. Authenticate the user (Supabase JWT in Authorization header)
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get LinkedIn profile URL from LinkedIn OIDC identity
  const identity = user.identities?.find(
    (id) => id.provider === "linkedin" || id.provider === "linkedin_oidc"
  );
  let linkedinProfileUrl: string | undefined;
  if (identity?.identity_data?.access_token) {
    try {
      const profileRes = await fetch(
        "https://api.linkedin.com/v2/me?projection=(id,vanityName)",
        {
          headers: {
            Authorization: `Bearer ${identity.identity_data.access_token}`,
          },
        }
      );
      const profile = await profileRes.json();
      if (profile.vanityName) {
        linkedinProfileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
      }
    } catch (err) {}
  }
  if (!linkedinProfileUrl) {
    return NextResponse.json(
      { error: "Cannot find LinkedIn profile URL in identity metadata." },
      { status: 400 }
    );
  }

  // 3. Store the LinkedIn URL in Supabase
  const { error: urlUpdateError } = await supabase
    .from("users")
    .update({ linkedin_profile_url: linkedinProfileUrl })
    .eq("id", user.id);
  if (urlUpdateError) {
    return NextResponse.json(
      { error: "Failed to store LinkedIn profile URL.", details: urlUpdateError.message },
      { status: 500 }
    );
  }

  // 4. Call EnrichLayer with the LinkedIn URL and await response
  let enrichData: any = {};
  try {
    const enrichResp = await fetch(
      `${ENRICHLAYER_URL}?linkedin_profile_url=${encodeURIComponent(
        linkedinProfileUrl
      )}&${ENRICH_PARAMS}`,
      {
        headers: { Authorization: `Bearer ${process.env.ENRICH_API_KEY}` },
      }
    );
    if (enrichResp.ok) {
      enrichData = await enrichResp.json();
    }
  } catch (e) {
    // will store empty object if error
  }

  // 5. Store EnrichLayer JSON in Supabase (jsonb field: linkedin_enrich_json)
  const { error: enrichUpdateError } = await supabase
    .from("users")
    .update({ linkedin_enrich_json: enrichData })
    .eq("id", user.id);
  if (enrichUpdateError) {
    return NextResponse.json(
      { error: "Failed to store EnrichLayer JSON.", details: enrichUpdateError.message },
      { status: 500 }
    );
  }

  // 6. Fetch and return the updated user row; always return valid JSON
  const { data: updatedUser, error: fetchError } = await supabase
    .from("users")
    .select("id, email, linkedin_profile_url, linkedin_enrich_json")
    .eq("id", user.id)
    .single();

  if (fetchError || !updatedUser) {
    return NextResponse.json(
      { error: "Failed to fetch updated user row.", details: fetchError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...updatedUser,
    linkedin_enrich_json:
      updatedUser.linkedin_enrich_json &&
      Object.keys(updatedUser.linkedin_enrich_json).length > 0
        ? updatedUser.linkedin_enrich_json
        : EMPTY_JSON,
  });
}
