import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get LinkedIn email and ID from user's metadata
  const email = user.email;
  const linkedinId = user.user_metadata?.provider_id || user.identities?.[0]?.id;

  // 1. Call EnrichLayer Contact API
  const contact = await fetch(
    `https://api.enrichlayer.com/contact?email=${encodeURIComponent(email)}`,
    { headers: { "x-api-key": process.env.ENRICHLAYER_API_KEY! } }
  ).then(res => res.json());

  // 2. Call EnrichLayer People API (optional, for more fields)
  const people = await fetch(
    `https://api.enrichlayer.com/people?linkedin_id=${encodeURIComponent(linkedinId)}`,
    { headers: { "x-api-key": process.env.ENRICHLAYER_API_KEY! } }
  ).then(res => res.json());

  // 3. Upsert resume in Supabase
  const { data: resume, error } = await supabase
    .from("resumes")
    .upsert([{ user_id: user.id, email, linkedinId, contact, people }], { onConflict: ['user_id'] })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(resume);
}