"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        router.replace("/dashboard");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      const resp = await fetch("/api/linkedin/fetch", { method: "POST" });
      const data = await resp.json();
      setResume(data);
      setLoading(false);
    })();
  }, [router, searchParams]);

  if (loading) return <div>Loading…</div>;
  if (!resume) return <div>No resume data found.</div>;

  return (
    <div>
      <h1>Your Resume</h1>
      <pre>{JSON.stringify(resume, null, 2)}</pre>
    </div>
  );
}