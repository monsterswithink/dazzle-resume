// ...same imports and constants...

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Find the user's resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // 3. Get LinkedIn profile URL
  let linkedinProfileUrl = resume.linkedin_profile_url;
  if (!linkedinProfileUrl) {
    // Optionally: fetch from identity if not present
    const identity = user.identities?.find(
      (id) => id.provider === "linkedin" || id.provider === "linkedin_oidc"
    );
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
          await supabase
            .from("resumes")
            .update({ linkedin_profile_url: linkedinProfileUrl })
            .eq("user_id", user.id);
        }
      } catch (err) {}
    }
  }
  if (!linkedinProfileUrl) {
    return NextResponse.json({ error: "No LinkedIn profile URL found" }, { status: 400 });
  }

  // 4. Fetch and store LinkedIn data via EnrichLayer
  let enrichData = {};
  try {
    const enrichResp = await fetch(
      `${ENRICHLAYER_URL}?linkedin_profile_url=${encodeURIComponent(linkedinProfileUrl)}&${ENRICH_PARAMS}`,
      { headers: { Authorization: `Bearer ${process.env.ENRICH_API_KEY}` } }
    );
    if (enrichResp.ok) enrichData = await enrichResp.json();
  } catch (e) {}

  // 5. Update the resume's linkedin_data
  const { error: updateError } = await supabase
    .from("resumes")
    .update({ linkedin_data: enrichData })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update linkedin_data", details: updateError.message }, { status: 500 });
  }

  // 6. Return the updated resume row
  const { data: updatedResume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(updatedResume);
}
