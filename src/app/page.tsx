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
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#e0e5ec" }}>
        <div className="neo-card text-center">
          <div className="text-4xl mb-4 animate-pulse">🎮</div>
          <p className="text-lg font-semibold" style={{ color: "#2d3748" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={(u: UserData) => setUser(u)} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
}
