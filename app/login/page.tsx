"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldAlert, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/db";
import { auth as firebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "citizen";

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"citizen" | "admin">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync role from query params if changed
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin" || roleParam === "citizen") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Simulate Auth
    setTimeout(() => {
      setLoading(false);
      if (isSignUp) {
        setMessage({
          type: "success",
          text: "Account created successfully! Verification email sent (simulated). You can now log in."
        });
        setIsSignUp(false);
      } else {
        // Log in simulation
        if (role === "admin") {
          localStorage.setItem("user_role", "admin");
          localStorage.setItem("user_name", "Chief Inspector Sarah Jenkins");
          localStorage.setItem("user_id", "user-admin");
          router.push("/admin/dashboard");
        } else {
          localStorage.setItem("user_role", "citizen");
          localStorage.setItem("user_name", fullName || "Elena Rostova");
          localStorage.setItem("user_id", "user-1");
          router.push("/citizen/dashboard");
        }
      }
    }, 1500);
  };

  const handleDemoLogin = (selectedRole: "citizen" | "admin") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (selectedRole === "admin") {
        localStorage.setItem("user_role", "admin");
        localStorage.setItem("user_name", "Chief Inspector Sarah Jenkins");
        localStorage.setItem("user_id", "user-admin");
        router.push("/admin/dashboard");
      } else {
        localStorage.setItem("user_role", "citizen");
        localStorage.setItem("user_name", "Elena Rostova");
        localStorage.setItem("user_id", "user-1");
        router.push("/citizen/dashboard");
      }
    }, 800);
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setMessage(null);

    // If Firebase is configured, use Firebase Sign-In
    if (isFirebaseConfigured && firebaseAuth) {
      if (provider === "google") {
        try {
          const result = await signInWithPopup(firebaseAuth, googleProvider);
          const user = result.user;
          if (user) {
            const email = user.email || "";
            const isAdmin = email.endsWith(".gov") || email.includes("admin");
            const userRole = isAdmin ? "admin" : role;
            
            localStorage.setItem("user_role", userRole);
            localStorage.setItem("user_name", user.displayName || email.split("@")[0] || "User");
            localStorage.setItem("user_id", user.uid);
            
            setLoading(false);
            if (userRole === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/citizen/dashboard");
            }
          }
        } catch (err: any) {
          setLoading(false);
          setMessage({ type: "error", text: `Google authentication failed: ${err.message}` });
        }
      } else {
        setLoading(false);
        setMessage({ type: "error", text: "GitHub login is not supported in Firebase configuration mode. Please use Google Login." });
      }
      return;
    }

    // If Supabase is configured, use real sign-in
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setLoading(false);
        setMessage({ type: "error", text: `${provider} authentication failed: ${err.message}` });
      }
      return;
    }

    // Otherwise, simulate a real OAuth Login popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `/auth/${provider}-mock?role=${role}`,
      `${provider} Sign-In`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === `${provider.toUpperCase()}_MOCK_LOGIN`) {
        const { user } = event.data;
        
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("user_id", user.id);
        
        setLoading(false);
        window.removeEventListener("message", handleMessage);
        
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/citizen/dashboard");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        setLoading(false);
        window.removeEventListener("message", handleMessage);
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
          Back to Landing
        </Link>

        {/* Brand logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-outfit text-xl font-bold tracking-tight">
              AirSight
            </span>
            <span className="font-outfit text-xl font-black text-cyan-400"> AI</span>
          </div>
        </div>

        <GlassCard className="p-8 border-white/5 bg-slate-900/40" glowColor={role === "admin" ? "emerald" : "cyan"} hoverGlow={false}>
          {/* Role selector tab */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-white/5 mb-8">
            <button
              type="button"
              onClick={() => setRole("citizen")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === "citizen"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Citizen Portal
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === "admin"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Municipality Command
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-outfit text-xl font-extrabold mb-1.5">
              {isSignUp ? "Create AirSight Account" : "Access Platform"}
            </h2>
            <p className="text-xs text-slate-400">
              {role === "admin"
                ? "Sign in with government administrator credentials"
                : "Submit, track, and get alerts for environmental complaints"}
            </p>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border mb-6 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() =>
                      setMessage({ type: "success", text: "Password reset link sent (simulated)." })
                    }
                    className="text-[10px] text-cyan-400 hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold text-slate-950 flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : role === "admin"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                  : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Register Account" : "Access Dashboard"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login simulation */}
          {!isSignUp && (
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <button
                type="button"
                onClick={() => handleDemoLogin(role)}
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Brain className="w-4 h-4 text-cyan-400" />
                Demo Auto-Login ({role === "admin" ? "Chief Jenkins" : "Elena Rostova"})
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                  className="py-3 bg-slate-950 border border-white/5 hover:bg-slate-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("github")}
                  className="py-3 bg-slate-950 border border-white/5 hover:bg-slate-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          )}

          {/* Toggle login/signup */}
          <div className="mt-8 text-center text-xs text-slate-400">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
