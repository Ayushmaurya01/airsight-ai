"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        router.push("/login");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || "";
        const isAdmin = email.endsWith(".gov") || email.includes("admin");
        const role = isAdmin ? "admin" : "citizen";
        
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_name", session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "User");
        localStorage.setItem("user_id", session.user.id);
        
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/citizen/dashboard");
        }
      } else {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Finalizing secure authentication...</p>
    </div>
  );
}
