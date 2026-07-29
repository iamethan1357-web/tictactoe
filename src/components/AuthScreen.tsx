"use client";

import { useState } from "react";
import type { UserData } from "@/app/page";

interface AuthScreenProps {
  onLogin: (user: UserData) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { login: form.username, password: form.password }
          : form;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Fetch full user data
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.user) {
        onLogin(meData.user);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#e0e5ec" }}
    >
      <div className="neo-card w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎮</div>
          <h1
            className="text-3xl font-black"
            style={{ color: "#2d3748" }}
          >
            Tic Tac Toe Arena
          </h1>
          <p className="mt-2" style={{ color: "#718096" }}>
            Play with friends or challenge the AI
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              mode === "login"
                ? "neo-pressed"
                : "neo-btn"
            }`}
            style={{ color: mode === "login" ? "#6c5ce7" : "#718096" }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              mode === "register"
                ? "neo-pressed"
                : "neo-btn"
            }`}
            style={{ color: mode === "register" ? "#6c5ce7" : "#718096" }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div
            className="neo-pressed p-3 mb-4 text-center text-sm font-medium rounded-xl"
            style={{ color: "#e17055" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: "#718096" }}
                >
                  Display Name
                </label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="Your display name"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: "#718096" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  className="neo-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
            </>
          )}

          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "#718096" }}
            >
              Username
            </label>
            <input
              type="text"
              className="neo-input"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "#718096" }}
            >
              Password
            </label>
            <input
              type="password"
              className="neo-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neo-btn-accent w-full py-4 text-lg rounded-xl disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Deploy Guide Link */}
        <div className="text-center mt-6">
          <a
            href="/deploy"
            className="text-sm font-medium"
            style={{ color: "#6c5ce7", textDecoration: "underline" }}
          >
            🚀 How to deploy this app (Neon + Vercel guide)
          </a>
        </div>
      </div>
    </div>
  );
}
