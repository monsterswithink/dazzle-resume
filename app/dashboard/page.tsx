"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      // Guarantee resume exists + is synced
      const response = await fetch("/api/linkedin/fetch", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setResume(data);
      } else {
        setError(data.error || "Resume sync failed");
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!resume) return <div>No resume found</div>;

  return (
    <div>
      <h1>Your Resume</h1>
      <pre>{JSON.stringify(resume, null, 2)}</pre>
    </div>
  );
}
