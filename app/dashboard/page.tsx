"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;
    const code = searchParams.get("code");

    async function handleSession() {
      // If code is present, exchange for session (browser context!)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        // Remove code param from URL for a clean look
        router.replace("/dashboard");
      }
      // Always check session after possible exchange
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(session);
        setSessionChecked(true);
        if (!session) {
          router.replace("/");
        }
      }
    }
    handleSession();
    return () => { isMounted = false };
  }, [router, searchParams]);

  if (!sessionChecked) return <div>Loading…</div>;
  if (!session) return null;

  return (
    <div>
      <h1>Your Dashboard</h1>
      {/* Your dashboard logic here */}
    </div>
  );
}
