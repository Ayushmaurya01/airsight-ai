"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GoogleMockLoginContent() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") || "citizen";

  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customRole, setCustomRole] = useState<"citizen" | "admin">(requestedRole as any);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const accounts = [
    {
      id: "user-1",
      name: "Elena Rostova",
      email: "elena.rostova@gmail.com",
      role: "citizen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    {
      id: "user-admin",
      name: "Chief Inspector Sarah Jenkins",
      email: "sarah.jenkins@municipal.gov",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
  ];

  const handleSelectAccount = (user: { id: string; name: string; email: string; role: string }) => {
    setLoadingUser(user.email);
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_MOCK_LOGIN",
            user,
          },
          window.location.origin
        );
      }
      window.close();
    }, 1800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    const user = {
      id: "custom-" + Math.random().toString(36).substr(2, 9),
      name: customName,
      email: customEmail,
      role: customRole,
    };

    handleSelectAccount(user);
  };

  return (
    <div className="w-full max-w-sm bg-[#242424] rounded-lg border border-[#333] p-8 shadow-2xl flex flex-col items-center">
      {/* Google G Logo */}
      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full p-2 mb-4">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="#EA4335"
            d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.24 1 3.21 3.82 1.41 7.92l3.77 2.92C6.09 7.64 8.81 5.04 12 5.04z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.81-.07-1.6-.2-2.3H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.72-4.94 3.72-8.66z"
          />
          <path
            fill="#FBBC05"
            d="M5.18 10.84a7.19 7.19 0 0 1 0 2.32l-3.77 2.92A11.96 11.96 0 0 1 1 12c0-1.47.27-2.88.75-4.18l3.43 2.67v.35z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.08.72-2.46 1.15-4.26 1.15-3.19 0-5.91-2.6-6.82-5.8l-3.77 2.92C3.21 20.18 7.24 23 12 23z"
          />
        </svg>
      </div>

      <h1 className="text-lg font-medium text-white mb-1">Sign in with Google</h1>
      <p className="text-xs text-[#9aa0a6] mb-6">to continue to <span className="text-cyan-400 font-semibold">AirSight AI</span></p>

      {loadingUser ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-xs text-white font-medium">Signing in as</p>
            <p className="text-[11px] text-[#9aa0a6] font-mono mt-0.5">{loadingUser}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3">
          {!showCustomForm ? (
            <>
              <div className="border border-[#3c4043] rounded-md divide-y divide-[#3c4043] overflow-hidden">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2d2d2d] transition-colors text-left"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#444]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{acc.name}</p>
                      <p className="text-[10px] text-[#9aa0a6] truncate">{acc.email}</p>
                    </div>
                    <span className="text-[8px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full py-2.5 border border-dashed border-[#444] hover:border-[#555] rounded-md text-xs text-[#9aa0a6] hover:text-white transition-all text-center font-medium mt-2"
              >
                + Use another / custom account
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 w-full">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9aa0a6] font-semibold block uppercase">Profile Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#1a1a1a] border border-[#444] focus:border-blue-500 rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9aa0a6] font-semibold block uppercase">Google Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="john.doe@gmail.com"
                  className="w-full bg-[#1a1a1a] border border-[#444] focus:border-blue-500 rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9aa0a6] font-semibold block uppercase">Account Role</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setCustomRole("citizen")}
                    className={`py-1.5 rounded text-xs font-bold transition-all border ${
                      customRole === "citizen"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-transparent border-[#444] text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomRole("admin")}
                    className={`py-1.5 rounded text-xs font-bold transition-all border ${
                      customRole === "admin"
                        ? "bg-emerald-600/10 border-emerald-500 text-emerald-400"
                        : "bg-transparent border-[#444] text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 py-2 bg-[#2d2d2d] hover:bg-[#333] text-xs font-medium rounded text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-medium rounded text-white transition-colors"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function GoogleMockLoginPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e3e3e3] font-sans flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#242424] rounded-lg border border-[#333] p-8 shadow-2xl flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <GoogleMockLoginContent />
      </Suspense>
    </div>
  );
}
