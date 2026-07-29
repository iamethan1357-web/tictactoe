"use client";

import { useState, useEffect, useCallback } from "react";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/Dashboard";

export interface UserData {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  wins: number;
  losses: number;
  draws: number;
  currentLevel: number;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try { const res = await fetch("/api/auth/me"); if (res.ok) { const d = await res.json(); if (d.user) setUser(d.user); } } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neo anim-in" style={{ textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>✏️</div>
          <p style={{ fontSize: 18, color: "var(--ink-mid)", fontFamily: "'Architects Daughter', cursive" }}>opening notebook…</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onLogin={(u: UserData) => setUser(u)} />;

  return (
    <Dashboard user={user}
      onLogout={async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); }}
      onUserUpdate={setUser} />
  );
}
