"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    // Wait for session restoration
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(session);
        setSessionChecked(true);
        if (!session) {
          router.replace("/"); // Only redirect if truly not logged in
        }
      }
    })();
    return () => { isMounted = false };
  }, [router]);

  if (!sessionChecked) {
    // Don't show dashboard or redirect until we know
    return <div>Loading…</div>;
  }
  if (!session) {
    // This will never render because of the redirect, but it's a fallback
    return <div>Redirecting…</div>;
  }

  // Now safe to fetch user data, resumes, etc.
  return (
    <div>
      <h1>Your Dashboard</h1>
      {/* Insert resume grid, API fetches, etc. here */}
    </div>
  );
}
