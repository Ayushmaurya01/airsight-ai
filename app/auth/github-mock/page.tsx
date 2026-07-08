"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GitHubMockLoginContent() {
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
      email: "elena.rostova@github.com",
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
            type: "GITHUB_MOCK_LOGIN",
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
    <div className="w-full max-w-sm bg-[#161b22] rounded-lg border border-[#30363d] p-8 shadow-2xl flex flex-col items-center">
      {/* GitHub Logo */}
      <div className="text-white mb-4">
        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      </div>

      <h1 className="text-lg font-medium text-white mb-1">Sign in with GitHub</h1>
      <p className="text-xs text-[#8b949e] mb-6">to authorize <span className="text-cyan-400 font-semibold">AirSight AI</span></p>

      {loadingUser ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-xs text-white font-medium">Signing in as</p>
            <p className="text-[11px] text-[#8b949e] font-mono mt-0.5">{loadingUser}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3">
          {!showCustomForm ? (
            <>
              <div className="border border-[#30363d] rounded-md divide-y divide-[#30363d] overflow-hidden">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#21262d] transition-colors text-left"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#30363d]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{acc.name}</p>
                      <p className="text-[10px] text-[#8b949e] truncate">{acc.email}</p>
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
                className="w-full py-2.5 border border-dashed border-[#30363d] hover:border-[#444c56] rounded-md text-xs text-[#8b949e] hover:text-white transition-all text-center font-medium mt-2"
              >
                + Use another / custom account
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 w-full">
              <div className="space-y-1">
                <label className="text-[10px] text-[#8b949e] font-semibold block uppercase">Profile Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#8b949e] font-semibold block uppercase">GitHub Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="john.doe@github.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#8b949e] font-semibold block uppercase">Account Role</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setCustomRole("citizen")}
                    className={`py-1.5 rounded text-xs font-bold transition-all border ${
                      customRole === "citizen"
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-transparent border-[#30363d] text-[#8b949e] hover:text-white"
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
                        : "bg-transparent border-[#30363d] text-[#8b949e] hover:text-white"
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
                  className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-xs font-medium rounded text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-medium rounded text-white transition-colors"
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

export default function GitHubMockLoginPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#161b22] rounded-lg border border-[#30363d] p-8 shadow-2xl flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <GitHubMockLoginContent />
      </Suspense>
    </div>
  );
}
