"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch resume on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
        return;
      }
      supabase
        .from("resumes")
        .select("*")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) setError("Could not fetch your resume.");
          else setResumeData(data);
        });
    });
  }, []);

  // Handler for LinkedIn sync button
  const handleLinkedInSync = async () => {
    setSyncing(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("You must be logged in.");
      setSyncing(false);
      return;
    }
    const res = await fetch("/api/linkedin/fetch", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const result = await res.json();
    if (res.ok) setResumeData(result);
    else setError(result.error || "Sync failed.");
    setSyncing(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button
        onClick={handleLinkedInSync}
        disabled={syncing}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {syncing ? "Syncing..." : "Sync LinkedIn"}
      </button>
      {resumeData && (
        <pre className="mt-8 bg-gray-100 rounded p-4 overflow-x-auto">
          {JSON.stringify(resumeData, null, 2)}
        </pre>
      )}
    </div>
  );
}
