import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Linkedin } from "lucide-react";

export function AuthButton() {
  const [loading, setLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "openid profile email r_liteprofile r_emailaddress",
          flow: "pkce", // <--- this is the fix
        },
      });

      if (error) {
        console.error("Auth error:", error);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLinkedInAuth} disabled={loading} className="w-full" size="lg">
      <Linkedin className="mr-2 h-4 w-4" />
      {loading ? "Connecting..." : "Connect with LinkedIn"}
    </Button>
  );
}
